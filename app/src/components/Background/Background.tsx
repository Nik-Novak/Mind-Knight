"use client";
import { GameMap } from "@/types/game";
import { useStore } from "@/zustand/store";
import { ReactNode } from "react"

type Props = React.HTMLAttributes<HTMLDivElement>;
export default function Background(props: Props){
  const map = useStore(state=>state.game?.game_found.Map) as GameMap|undefined;
  console.log('MAP', map);
  return (
    <main id='content' style={{background: map!=undefined && GameMap[map] ? `url(/img/maps/${GameMap[map]}.png) center/cover no-repeat` : '#222'}} {...props}>
      {props.children}
    </main>
  )
}