"use client";
import { GameMap } from "@/types/game";
import { useStore } from "@/zustand/store";
import { ReactNode } from "react"

type Props = React.HTMLAttributes<HTMLDivElement>;
export default function Background(props: Props){
  const map = useStore(state=>state.game?.game_found.Map) as GameMap|undefined;
  return (
    <main style={{background: `url(/img/maps/${map!=undefined && GameMap[map] ? GameMap[map] : 'background'}.png) center/cover no-repeat` }} {...props}>
      {props.children}
    </main>
  )
}