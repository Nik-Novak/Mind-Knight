"use client";
import { GameMap } from "@/types/game";
import { getHappeningMission } from "@/utils/functions/game";
import { useStore } from "@/zustand/store";
import { ReactNode } from "react"

type Props = React.HTMLAttributes<HTMLDivElement>;
export default function Background(props: Props){
  const map = useStore(state=>state.game?.game_found.Map) as GameMap|undefined;
  const playhead = useStore(state=>state.playhead);
  const missions = useStore(state=>state.game?.missions);
  const happeningMission = getHappeningMission(missions, playhead, 0);
  return (
    <main style={{
      background: `url(/img/maps/${happeningMission ? 'black' : map!=undefined && GameMap[map] ? GameMap[map] : 'background'}.png) center/cover no-repeat`,
      transition: 'background 1s'
    }} {...props}>
      {props.children}
    </main>
  )
}
