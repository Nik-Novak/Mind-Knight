"use client";
import { PlayerSlot } from "@/types/game";
import { getColoredUsername, hasHappened } from "@/utils/functions/game";
import { insertBetween } from "@/utils/functions/general";
import { useStore } from "@/zustand/store";
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import { Mission } from "@prisma/client";
import { useSettings } from "../SettingsProvider";

type Props = {
  mission?: Mission,
  inMission?: boolean,
  isHacker?: boolean
}

export default function MissionControls({mission, inMission, isHacker}:Props){
  const { settings } = useSettings();
  const { palette } = useTheme();
  const playhead = useStore(state=>state.playhead);
  const game_players = useStore(state=>state.game?.game_players);
  if(mission === undefined) return null;
  const nodeTeam = mission.mission_phase_start.Players as PlayerSlot[];
  const renderNodeTeam = game_players && nodeTeam.map(slot=>getColoredUsername(game_players, slot, slot)).reduce((accum, cu, i)=>{
    accum.push(cu);
    if(i<nodeTeam.length-1)
      accum.push(<span key={i+50}>, </span>);
    return accum;
  }, [] as React.ReactNode[]);

  if(mission.mission_phase_end && hasHappened(mission.mission_phase_end?.log_time, playhead)){
    let numHacks = mission.mission_phase_end.NumHacks;
    return (
      <Stack alignItems='center' sx={{position:'absolute', top:'45%'}}>
      <Typography color={mission.mission_phase_end?.Failed ? palette.custom.hacked : palette.custom.secured} variant="h5">Node {mission.mission_phase_start.Mission} {mission.mission_phase_end?.Failed ? 'COMPROMISED' : 'SECURED'}</Typography>
      <Typography variant="h6">{ numHacks || 'No'} hacker{numHacks>1?'s':''} detected.</Typography>
    </Stack>
    )
  }
  else
    return (
      <Stack alignItems='center' sx={{position:'absolute', top:'45%'}}>
        <Typography variant="h5">{ inMission ? isHacker || settings.streamer_mode ? 'CHOOSE WHAT TO DO' : 'SECURE THE NODE' : 'WAIT FOR THE MISSION' }</Typography>
        <Typography variant="h6">Node team:</Typography>
        <Typography>{renderNodeTeam}</Typography>
        { inMission && <Stack mt={5} direction={'row'} spacing={5}>
          <IconButton 
            disabled = {settings.alpha_mode&&isHacker&&!settings.streamer_mode}
            sx={{ 
              padding:0, 
              border: settings.alpha_mode&&isHacker&&!settings.streamer_mode ? undefined : '2px solid white', 
              width:'15vh', height:'15vh', 
              maxWidth:80, maxHeight:80, 
              bgcolor:palette.custom.secured, 
              '&:hover': {
                bgcolor: palette.custom.securedDark, // Keep the background red on hover
              },
              '&:disabled': {
                bgcolor: palette.custom.securedDark,
                opacity: 0.5
              },
            }}
          >
            <Typography sx={{fontWeight:'bold'}}>SECURE</Typography>
          </IconButton>
          <IconButton 
            disabled={!isHacker && !settings.streamer_mode}
            sx={{ 
              padding:0, 
              border: !isHacker && !settings.streamer_mode ? undefined : '2px solid white', 
              width:'15vh', height:'15vh', 
              maxWidth:80, maxHeight:80, 
              bgcolor:palette.custom.hacked, 
              '&:hover': {
                bgcolor: palette.custom.hackedDark, // Keep the background red on hover
              },
              '&:disabled': {
                bgcolor: palette.custom.hackedDark,
                opacity: 0.5
              },
            }}
          >
            <Typography sx={{fontWeight:'bold'}}>HACK</Typography>
          </IconButton>
        </Stack> }
      </Stack>
    );
}