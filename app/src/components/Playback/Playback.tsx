"use client";

import { getTimeComponents } from "@/utils/functions/general";
import { coloredText } from "@/utils/functions/jsx";
import { useStore } from "@/zustand/store";
import { Badge, IconButton, Slider, SliderMark, Stack, Tooltip } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import { ReactNode, useEffect, useReducer, useState } from "react";

type Mark = {
  value: number,
  label?: ReactNode
}

export default function Playback(){
  const playHead = useStore(state=>state.playHead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const incrementPlayhead = useStore(state=>state.incrementPlayHead);
  const game = useStore(state=>state.game);
  const [isPlaying, setIsPlaying] = useState(true);
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
  
  useEffect(()=>{
    setPlayHead(game?.game_found.log_time);
  }, [game?.game_found.log_time.valueOf()]);

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
    let label = '';
    let {hours, minutes, seconds} = getTimeComponents(game.game_found.log_time, value);
    if(hours)
      label += `${hours}h `
    if(minutes)
      label += `${minutes}m `
    label += `${seconds}s`;
    return label;
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