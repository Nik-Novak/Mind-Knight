"use client";
import { NodeNumber, PlayerSlot } from "@/types/game";
import { getTurnInfo } from "@/utils/functions/game";
import { useStore } from "@/zustand/store";
import { Stack, Typography } from "@mui/material";
import { GamePlayers } from "@prisma/client";

type Props = {
  // selectedNode: NodeNumber|undefined;
  // selectedTurn: number; //1..many
  // selectedSlot: PlayerSlot|undefined;
  // game_players: GamePlayers;
}

export default function NodeTeamRejects({}:Props){
  const selectedNode = useStore(state=>state.selectedNode);
  const selectedSlot = useStore(state=>state.selectedSlot);
  const selectedTurn = useStore(state=>state.selectedTurn);
  const game_players = useStore(state=>state.game?.game_players);
  let turnInfo = getTurnInfo(game_players, selectedNode, selectedTurn, selectedSlot);
  let numRejects = (turnInfo?.select_phase_start.propNumber||1) - 1
  return (
    <Stack sx={{width:'8.89vh', textAlign:'center'}}>
      <Typography my={'10px'} sx={{fontSize:'2vh', lineHeight:1}}>Node Teams Rejected</Typography>
      <Typography variant="h4" sx={{fontSize:'3vh', lineHeight:1}}>{numRejects}/5</Typography>
    </Stack>
  )
}