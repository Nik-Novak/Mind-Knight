"use client";
import { NodeNumber } from "@/types/game";
import { hasHappened as checkHasHappened } from "@/utils/functions/game";
import { useStore } from "@/zustand/store";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { GameFound, Missions } from "@prisma/client";
import { useEffect } from "react";

type NodeProps = {
  hacked:boolean|undefined,
  numPlayers: number,
  selected?: boolean,
  onClick?: ()=>void
}
function Node({ numPlayers, hacked, selected, onClick=()=>{}}:NodeProps){
  let bgColor = '#696969' //default
  let hoverColor = '#595959' //default
  if(hacked===true){
    bgColor = '#952C30';
    hoverColor = '#851C20';
  }
  else if(hacked === false){
    bgColor = '#25A165';
    hoverColor = '#159155';
  }
  return <IconButton onClick={onClick} sx={{ padding:0, border:selected?'2px solid white':undefined, width:'15vh', height:'15vh', maxWidth:80, maxHeight:80, bgcolor:bgColor, '&:hover': {
    bgcolor: hoverColor, // Keep the background red on hover
  }}}>
    <Typography sx={{fontWeight:'bold'}}>{numPlayers}</Typography>
  </IconButton>
}

type Props = {
  // game_found: GameFound,
  // missions?: Missions,
  // selectedNode: NodeNumber|undefined,
}

export default function Nodes({}:Props){
  const { selectedNode, setSelectedNode } = useStore();
  const game_found = useStore(state=>state.game?.game_found);
  const missions = useStore(state=>state.game?.missions);
  const playHead = useStore(state=>state.playHead);

  return (
    <Stack m={'10%'} height={'80vh'} maxHeight={'637px'} justifyContent={'space-between'}>
      {
        game_found?.MissionInfo.map((numPlayers, i)=>{
          let n = i+1 as NodeNumber;
          let hasHappened = checkHasHappened(missions?.[n]?.mission_phase_end?.log_time, playHead); //playHead && missions?.[n]?.mission_phase_end?.log_time ? missions[n]!.mission_phase_end!.log_time.valueOf() < playHead.valueOf() : true;
          // if( missions?.[n]?.mission_phase_end?.log_time && missions[n]!.mission_phase_end!.log_time.valueOf() > new Date('2024-04-07T20:01:48.000Z').valueOf() )
          //   return null;
          let hacked = missions?.[n]?.mission_phase_end?.Failed
          return <Node key={n} hacked={ hasHappened ? hacked : undefined} numPlayers={numPlayers} selected={selectedNode === i+1} onClick={()=>setSelectedNode(n)} />
        })
      }
    </Stack>
  )
}