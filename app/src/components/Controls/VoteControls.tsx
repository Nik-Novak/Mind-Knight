"use client";
import { PlayerSlot } from "@/types/game";
import { getColoredUsername, hasHappened } from "@/utils/functions/game";
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
  const playhead = useStore(state=>state.playhead);
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
  if(proposal.vote_phase_end && hasHappened(proposal.vote_phase_end.log_time, playhead)){
    let passed = proposal.vote_phase_end.Passed;
    let accepted = proposal.vote_phase_end.VotesFor as PlayerSlot[];
    let refused = proposal.vote_phase_end.VotesAgainst as PlayerSlot[];
    return (
      <Stack alignItems='center' sx={{position:'absolute', top:'45%'}}>
      <Typography color={passed ? 'green' : 'red'} variant="h4">NODE TEAM {passed ? 'ACCEPTED' : 'REFUSED'}</Typography>
      <table style={{marginTop:5}}>
        <thead>
          <tr>
            <th style={{background:'green', padding:5, paddingInline:20, borderSpacing:'10px', border: ''}}><Typography variant="h5">ACCEPT VOTES</Typography></th>
            <th style={{width: '20px'}}></th> {/* Empty th with specific width for spacing */}
            <th style={{background:'red', padding:5, paddingInline:20}}><Typography variant="h5">REJECT VOTES</Typography></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(accepted.length, refused.length) }, (_, index) => (
            <tr key={index}>
              <td style={{textAlign:'center', padding:2, fontSize:'20px'}}>{accepted[index]!==undefined ? getColoredUsername(game_players,accepted[index]) : ''}</td>
              <td></td>
              <td style={{textAlign:'center', padding:2,  fontSize:'20px'}}>{refused[index]!==undefined ? getColoredUsername(game_players,refused[index]) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Stack>
    )
  }
  else
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