"use client";
import { useStore } from "@/zustand/store";
import { Game } from "@prisma/client";
import { useEffect } from "react";

type Props = {
  game:Game,
  time?: number
}
export default function GameAssigner({game, time}:Props){
  const setGame = useStore(state=>state.setGame);
  const setPlayhead = useStore(state=>state.setPlayhead);
  useEffect(()=>{
    if(game){
      setGame(game);
      if(time){
        console.log('SET PLAYHEAD TO', time);
        setPlayhead(time);
      }
    }
  }, [game.id]);
  return null;
}