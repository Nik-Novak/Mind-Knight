"use client";

import { getTimeComponents, getTimeDifferenceFromString, getTimeString } from "@/utils/functions/general";
import { coloredText } from "@/utils/functions/jsx";
import { useStore } from "@/zustand/store";
import { Badge, IconButton, Slider, SliderMark, Stack, Tooltip } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import { ReactNode, useEffect, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {useQueryState} from 'nuqs'

type Mark = {
  value: number,
  label?: ReactNode
}

export default function Playback(){
  const playHead = useStore(state=>state.playHead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const incrementPlayhead = useStore(state=>state.incrementPlayHead);
  const game = useStore(state=>state.game);
  // const searchParams = useSearchParams();
  const [t, setT] = useQueryState('t');
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  type SpeedMultiplier = 1|2|4|8|-1|-2|-4|-8;
  type Action = 'increase' | 'decrease' | 'reset';
  function playbackSpeedReducer(state: SpeedMultiplier, action: Action): SpeedMultiplier {
    switch (action) {
      case 'increase':
      return state < 0 ? 1 : Math.min(state*2, 8) as SpeedMultiplier;
      case 'decrease':
      return state > 0 ? -1 : Math.max(state*2, -8) as SpeedMultiplier;
      case 'reset':
      return 1;
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
      // if(document.readyState === "complete")
      setT(timeString);
    }
  }, [playHead]);

  useEffect(()=>{
    if(isPlaying){
      let playInterval = setInterval(()=>{
        incrementPlayhead(Math.sign(playbackSpeed)*1000)
      }, 1000 / Math.abs(playbackSpeed));
      return ()=>clearInterval(playInterval);
    }
  }, [isPlaying, playbackSpeed]);
  
  if(!game || !playHead)
    return <></>

  
  const getLabel = (value:number, index:number)=>{
    let {hours, minutes, seconds} = getTimeComponents(game.game_found.log_time, value);
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
  });
  return <Stack sx={{width:'100%', maxWidth:'33.36vw', alignItems:'center', backgroundColor:'rgba(47,46,44,0.5)', padding: '5px', borderRadius:'5px'}}>
    <Slider 
      valueLabelDisplay="auto" 
      valueLabelFormat={getLabel} 
      min={game.game_found.log_time.valueOf()} 
      max={game.latest_log_time.valueOf()}
      marks={marks}
      value={playHead?.valueOf()} 
      onChange={(evt, value)=>{typeof value === 'number' && setPlayHead(new Date(value))}}
    />
    <Stack direction='row'>
      <IconButton onClick={()=>{updatePlaybackSpeed('decrease'); setIsPlaying(true)}}>
        <Badge anchorOrigin={{vertical:'bottom', horizontal:'left'}} badgeContent={playbackSpeed < 0 ? playbackSpeed:undefined}><FastRewindIcon /></Badge>
      </IconButton>
      <IconButton onClick={()=>{updatePlaybackSpeed('reset'); setIsPlaying(v=>!v)}}>{isPlaying ? <PauseIcon /> : <PlayIcon /> }</IconButton>
      <IconButton onClick={()=>{updatePlaybackSpeed('increase'); setIsPlaying(true)}}>
        <Badge anchorOrigin={{vertical:'bottom', horizontal:'right'}} badgeContent={playbackSpeed > 1 ? playbackSpeed:undefined}><FastForwardIcon /></Badge>
      </IconButton>
    </Stack>
  </Stack>;
}