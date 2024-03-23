import { Box, IconButton } from "@mui/material";
import { NodeNumber } from "@/types/game";
import { GamePlayers } from "@prisma/client";
import { ReactNode } from "react";

type Props = {
  selectedNode: NodeNumber,
  selectedTurn: number,
  game_players: GamePlayers,
}

function maxTurns(selectedNode:NodeNumber, players:GamePlayers){
  let maxTurns = Object.entries(players).reduce((maxTurns, [key, player])=>{
    let currentTurns = player?.proposals[selectedNode].length;
    if(currentTurns !== undefined && currentTurns > maxTurns)
      return currentTurns
    return maxTurns;
  }, 1);
  return maxTurns;
}

export default function Turns({ selectedNode, selectedTurn, game_players }: Props){
  let numTurns = maxTurns(selectedNode, game_players);
  let turnNodes:ReactNode[] = [];
  for(let i=1; i<=numTurns; i++){
    let bgcolor = i+1===selectedTurn ? 'white': undefined;
      turnNodes.push(
        <IconButton sx={{ width:'2vh', height:'2vh', margin:'10px 5px', bgcolor, boxShadow: '0 0 5px 2px grey', '&:hover':{bgcolor, boxShadow: '0 0 5px 2px white'}  }}></IconButton>
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