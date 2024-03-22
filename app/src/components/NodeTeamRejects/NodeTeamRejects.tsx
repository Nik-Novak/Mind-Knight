import { NodeNumber, PlayerSlot } from "@/types/game";
import { Stack, Typography } from "@mui/material";
import { GamePlayers } from "@prisma/client";

type Props = {
  selectedNode: NodeNumber;
  selectedTurn: number; //1..many
  selectedSlot: PlayerSlot;
  game_players: GamePlayers;
}

export default function NodeTeamRejects({selectedNode, selectedTurn, selectedSlot, game_players}:Props){
  let turnInfo = game_players[selectedSlot]?.proposals[selectedNode][selectedTurn-1];
  let numRejects = (turnInfo?.propNumber||0) - 1
  return (
    <Stack sx={{width:'8.89vh', textAlign:'center'}}>
      <Typography my={'10px'} sx={{fontSize:'2vh', lineHeight:1}}>Node Teams Rejected</Typography>
      <Typography variant="h4">{numRejects}/5</Typography>
    </Stack>
  )
}