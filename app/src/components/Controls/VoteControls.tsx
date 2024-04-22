"use client";
import { PlayerSlot } from "@/types/game";
import { getColoredUsername } from "@/utils/functions/game";
import { insertBetween } from "@/utils/functions/general";
import { useStore } from "@/zustand/store";
import { Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { Mission, Proposal } from "@prisma/client";
import { useSettings } from "../SettingsProvider";
import { useEffect, useState } from "react";

type Props = {
  proposal?: Proposal
}
export default function MissionControls({proposal}:Props){
  const [choice, setChoice] = useState<'accepted'|'refused'>();
  const game_players = useStore(state=>state.game?.game_players);
  useEffect(()=>{
    setChoice(undefined);
  }, [proposal?.created_at]);
  if( !game_players || !proposal?.select_phase_end ) return null;
  const proposer = proposal.select_phase_end.Proposer as PlayerSlot;
  const nodeTeam = proposal.select_phase_end.SelectedTeam as PlayerSlot[];
  const renderNodeTeam = nodeTeam.map(slot=>getColoredUsername(game_players, slot, slot)).reduce((accum, cu, i)=>{
    accum.push(cu);
    if(i<nodeTeam.length-1)
      accum.push(<span key={i+50}>, </span>);
    return accum;
  }, [] as React.ReactNode[]);
  
  return (
    <Stack alignItems='center' sx={{position:'absolute', top:'45%'}}>
      <Typography variant="h5">{ getColoredUsername(game_players, proposer) } proposed</Typography>
      <Typography variant="h5">{renderNodeTeam}</Typography>
      <Typography sx={{mt:2}} variant="h5">for NODE {proposal.select_phase_start.Mission}</Typography>
      <Stack mt={2} direction={'row'} >
        <Button disabled={choice==='accepted'} onClick={()=>setChoice('accepted')} sx={{bgcolor:'#6c6c6c', color:'#ADADAD', fontSize:24, paddingX:10}} className="">ACCEPT</Button>
        <Button disabled={choice==='refused'} onClick={()=>setChoice('refused')} sx={{bgcolor:'#6c6c6c', color:'#ADADAD', fontSize:24, paddingX:10}} className="">REFUSE</Button>
      </Stack>
    </Stack>
  );
}