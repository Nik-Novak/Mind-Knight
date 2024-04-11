"use client";
import { Box, IconButton } from "@mui/material";
import { NodeNumber } from "@/types/game";
import { GamePlayers } from "@prisma/client";
import { ReactNode } from "react";
import { useStore } from "@/zustand/store";
import { maxTurns } from "@/utils/functions/game";

type Props = {
  // selectedNode: NodeNumber|undefined,
  // selectedTurn: number,
  // game_players: GamePlayers,
}



export default function Turns({ }: Props){
  const selectedNode = useStore(state=>state.selectedNode);
  const selectedTurn = useStore(state=>state.selectedTurn);
  const setSelectedTurn = useStore(state=>state.setSelectedTurn);
  const game_players = useStore(state=>state.game?.game_players);
  let numTurns = selectedNode && game_players ? maxTurns(selectedNode, game_players) : 1;
  let turnNodes:ReactNode[] = [];
  for(let i=1; i<=numTurns; i++){
    let bgcolor = i===selectedTurn ? 'white': undefined;
      turnNodes.push(
        <IconButton key={i} onClick={()=>setSelectedTurn(i)} sx={{ width:'2vh', height:'2vh', margin:'10px 5px', bgcolor, boxShadow: '0 0 5px 2px grey', '&:hover':{bgcolor, boxShadow: '0 0 5px 2px white'}  }}></IconButton>
      ) 
  }
  return (
    <>
    turn
    <Box>
      { turnNodes }
    </Box>
    </>
  )
}