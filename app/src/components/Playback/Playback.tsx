"use client";

import { useStore } from "@/zustand/store";
import { Slider } from "@mui/material";
import { useEffect } from "react";

export default function Playback(){
  const playHead = useStore(state=>state.playHead);
  const setPlayHead = useStore(state=>state.setPlayHead);
  const game = useStore(state=>state.game);
  useEffect(()=>{
    setPlayHead(new Date('2024-04-07T20:03:59.000Z'));
    return ()=>setPlayHead(undefined)
  }, []);
  if(!game || !playHead)
    return <></>
  return <>
    <Slider sx={{maxWidth:'70%'}} min={game?.game_found.log_time.valueOf()} max={game?.game_end?.log_time.valueOf()} value={playHead?.valueOf()} onChange={(evt, value)=>{typeof value === 'number' && setPlayHead(new Date(value))}}></Slider>
  </>;
}