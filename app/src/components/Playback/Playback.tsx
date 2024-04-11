"use client";

import { getTimeComponents } from "@/utils/functions/general";
import { coloredText } from "@/utils/functions/jsx";
import { useStore } from "@/zustand/store";
import { IconButton, Slider, SliderMark, Tooltip } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { ReactNode, useEffect, useState } from "react";

type Mark = {
  value: number,
  label?: ReactNode
}

export default function Playback(){
  const playHead = useStore(state=>state.playHead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const incrementPlayhead = useStore(state=>state.incrementPlayHead);
  const game = useStore(state=>state.game);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(()=>{
    setPlayHead(new Date('2024-04-07T20:03:59.000Z'));
    return ()=>setPlayHead(undefined)
  }, []);

  useEffect(()=>{
    if(isPlaying){
      let playInterval = setInterval(()=>{
        incrementPlayhead(1000)
      }, 1000);
      return ()=>clearInterval(playInterval);
    }
  }, [isPlaying]);
  
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
  return <>
    <Slider 
      sx={{maxWidth:'60%'}} 
      valueLabelDisplay="auto" 
      valueLabelFormat={getLabel} 
      min={game.game_found.log_time.valueOf()} 
      max={game.game_end?.log_time.valueOf()}
      marks={marks}
      value={playHead?.valueOf()} 
      onChange={(evt, value)=>{typeof value === 'number' && setPlayHead(new Date(value))}}
    />
    <IconButton onClick={()=>setIsPlaying(v=>!v)}>{isPlaying ? <PauseIcon /> : <PlayIcon /> }</IconButton>
  </>;
}