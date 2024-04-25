"use client";

import { copyToClipboard, getTimeComponents, getTimeDifferenceFromString, getTimeString } from "@/utils/functions/general";
import { coloredText } from "@/utils/functions/jsx";
import { useStore } from "@/zustand/store";
import { Badge, Button, IconButton, Slider, SliderMark, Stack, Tooltip } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import { ReactNode, useEffect, useReducer, useState } from "react";
import ClipIcon from '@mui/icons-material/ContentCut';
import ShareIcon from '@mui/icons-material/IosShare';
import {useQueryState} from 'nuqs'
import ShareDialog from "./ShareDialog";
import FormButton from "../FormButton";
import { createClip } from "@/actions/game";
import { useNotificationQueue } from "../NotificationQueue";
import Notification from "../Notification";

type Mark = {
  value: number,
  label?: ReactNode
}

export default function Playback({}){
  const playHead = useStore(state=>state.playHead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const incrementPlayhead = useStore(state=>state.incrementPlayHead);
  const game = useStore(state=>state.game);
  const { pushNotification } = useNotificationQueue();
  // const searchParams = useSearchParams();
  const [t, setT] = useQueryState('t');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isClipping, setIsClipping] = useState(false);
  const [clipTimes, setClipTimes] = useState<[number, number]>([0, 0]);
  type SpeedMultiplier = 1|2|4|8|-1|-2|-4|-8;
  type Action = {type:'increase'} | {type:'decrease'} | {type:'reset'} | {type:'set', to:SpeedMultiplier};
  function playbackSpeedReducer(state: SpeedMultiplier, action: Action): SpeedMultiplier {
    switch (action.type) {
      case 'increase':
      return state < 0 ? 1 : Math.min(state*2, 8) as SpeedMultiplier;
      case 'decrease':
      return state > 0 ? -1 : Math.max(state*2, -8) as SpeedMultiplier;
      case 'reset':
      return 1;
      case 'set':
      return action.to;
    }
  }
  const [playbackSpeed, updatePlaybackSpeed] = useReducer(playbackSpeedReducer, 1);

  useEffect(()=>{ //sync playhead with url time
    let timeDiff = getTimeDifferenceFromString(t, game?.game_found?.log_time);
    if(timeDiff){
      setPlayHead(timeDiff);
      setIsPlaying(false);
    }
    else{
      setPlayHead(game?.game_found.log_time);
      setIsPlaying(true);
    }
  }, [game?.game_found.log_time.valueOf()]);

  useEffect(()=>{ //sync url time with playhead
    if(game?.game_found.log_time){
      const {hours, minutes, seconds} = getTimeComponents(game?.game_found.log_time, playHead);
      let timeString = getTimeString({hours, minutes, seconds});
      setT(timeString);
    }
  }, [playHead]);

  useEffect(()=>{
    if(isPlaying){
      let playInterval = setInterval(()=>{
        incrementPlayhead(Math.sign(playbackSpeed)*1000, clipTimes, isClipping)
      }, 1000 / Math.abs(playbackSpeed));
      return ()=>clearInterval(playInterval);
    }
  }, [isPlaying, playbackSpeed]);
  
  if(!game || !playHead)
    return <></>

  
  const getLabel = (value:number, from:number = game.game_found.log_time.valueOf())=>{
    let {hours, minutes, seconds} = getTimeComponents(from, value);
    return getTimeString({hours, minutes, seconds});
  }
  const marks:Mark[] = [];
  Object.entries(game.missions).forEach(([nodeNum, mission])=>{
    let missionEndTime = mission?.mission_phase_end?.log_time.valueOf();
    if(missionEndTime)
      marks.push({
        value:missionEndTime.valueOf(), 
        label:<Tooltip arrow title={`Node ${nodeNum}`}>{coloredText(nodeNum, mission?.mission_phase_end?.Failed ?'#851C20':'#159155' )}</Tooltip>
      });
    if(isClipping)
      marks.push({value:playHead.valueOf(), label: getLabel(playHead.valueOf(), Math.min(...clipTimes))})
  });
  return (
    <>
    <Stack sx={{width:'100%', maxWidth:'33.36vw', alignItems:'center', backgroundColor:'rgba(47,46,44,0.5)', padding: '5px', borderRadius:'5px'}}>
      <Slider 
        size={isClipping ? "small" : "medium"}
        color={isClipping ? "warning" : "primary"}
        slotProps={{thumb:{
          onMouseUp:()=>{
            if(!isClipping) return;
            let minClipTime = Math.min(...clipTimes);
            let maxClipTime = Math.max(...clipTimes)
            setPlayHead(new Date(minClipTime));
            setClipTimes([minClipTime, maxClipTime]);
            setIsPlaying(true);
          },
          onMouseDown:()=>{
            if(!isClipping) return;
            setIsPlaying(false);
          }
        }}}
        valueLabelDisplay="auto" 
        valueLabelFormat={value=>getLabel(value)} 
        min={game.game_found.log_time.valueOf()} 
        max={game.latest_log_time.valueOf()}
        marks={marks}
        value={isClipping ? clipTimes : playHead.valueOf() } 
        onChange={(evt, value, activeThumb)=>{
          if(typeof value === 'number')
            setPlayHead(new Date(value));
          else {
            if(activeThumb === 0){
              setPlayHead(new Date(value[0]));
              setClipTimes((clipTimes)=>[value[0], clipTimes[1]]);
            }
            else {
              setPlayHead(new Date(value[1]));
              setClipTimes((clipTimes)=>[clipTimes[0], value[1]]);
            }
          }
        }}
      />
      <Stack width='100%' direction='row' justifyContent='space-between'>
        <Stack aria-label="left" direction='row'>
          <IconButton onClick={()=>setIsShareOpen(true)}>
            <ShareIcon color={isShareOpen ? "warning" : "primary"} />
          </IconButton>
        </Stack>
        {!isClipping ? 
          <Stack aria-label="center" direction='row'>
            <IconButton onClick={()=>{updatePlaybackSpeed({type:'decrease'}); setIsPlaying(true)}}>
              <Badge anchorOrigin={{vertical:'bottom', horizontal:'left'}} badgeContent={playbackSpeed < 0 ? playbackSpeed:undefined}><FastRewindIcon color={playbackSpeed<0 ? "warning": "primary"} /></Badge>
            </IconButton>
            <IconButton onClick={()=>{updatePlaybackSpeed({type:'reset'}); setIsPlaying(v=>!v)}}>{isPlaying ? <PauseIcon color="warning" /> : <PlayIcon /> }</IconButton>
            <IconButton onClick={()=>{updatePlaybackSpeed({type:'increase'}); setIsPlaying(true)}}>
              <Badge anchorOrigin={{vertical:'bottom', horizontal:'right'}} badgeContent={playbackSpeed > 1 ? playbackSpeed:undefined}><FastForwardIcon color={playbackSpeed>1 ? "warning": "primary"} /></Badge>
            </IconButton>
          </Stack> 
        : 
          <form action={async ()=>{
            let clip = await createClip(game.id, clipTimes[0]-game.game_found.log_time.valueOf(), clipTimes[1]-game.game_found.log_time.valueOf());
            let link = `${window.location.protocol}//${window.location.host}/clip?id=${clip.id}`;
            await copyToClipboard(link);
            pushNotification(<Notification>Copied Clip Link!</Notification>);
            window.open(link, '_blank');
            setIsClipping(false);
            setIsPlaying(false);
            updatePlaybackSpeed({type:'reset'});
          }}>
            <FormButton variant="contained" className="pixel-corners-small" sx={{paddingX:'30px'}} color="warning"><ClipIcon sx={{mr:1}} /> Clip</FormButton>
          </form>
        }
        <Stack aria-label="right" direction='row'>
          <IconButton onClick={()=>{
            setIsClipping(c=>{
              if(!c){
                setClipTimes(c=>[playHead.valueOf(), playHead.valueOf()+60_000]); //default cliptimes
                setIsPlaying(true);
                updatePlaybackSpeed({type:'set', to:4 });
              }
              if(c){
                setIsPlaying(false); //stop autoplay when leaving clipmode
                updatePlaybackSpeed({type:'reset'});
              }
              return !c;
            });
          }}>
            <ClipIcon color={isClipping ? "warning" : "primary"} />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
    <ShareDialog open={isShareOpen} onClose={()=>setIsShareOpen(false)} />
    </>
  );
}