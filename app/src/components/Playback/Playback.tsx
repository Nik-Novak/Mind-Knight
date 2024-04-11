"use client";

import { useStore } from "@/zustand/store";
import { useEffect } from "react";

export default function Playback(){
  const { setPlayHead } = useStore();
  useEffect(()=>{
    setPlayHead(new Date('2024-04-07T20:03:59.000Z'));
    return ()=>setPlayHead(undefined)
  }, []);
  return <></>;
}