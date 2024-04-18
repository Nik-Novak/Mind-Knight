"use client";
import { NodeNumber, PlayerSlot } from "@/types/game";
import { hasHappened as checkHasHappened, getPlayer, getPlayerColor } from "@/utils/functions/game";
import { useStore } from "@/zustand/store";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { GameFound, Missions } from "@prisma/client";
import { ReactNode, useEffect } from "react";
import { useSettings } from "../SettingsProvider";
import { coloredText } from "@/utils/functions/jsx";
import { ColorCode, colors } from "@/utils/constants/colors";

type NodeProps = {
  hacked:boolean|undefined,
  numPlayers: number,
  selected?: boolean,
  proposer?:ReactNode,
  players?:ReactNode[],
  joshBluffed?:boolean
  onClick?: ()=>void
}
function Node({ numPlayers, hacked, selected, joshBluffed, proposer, players, onClick=()=>{}}:NodeProps){
  
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
  console.log(proposer)
  return (
    <Tooltip placement="left" disableHoverListener={proposer===undefined} title={<Stack fontSize='18px' direction='row' spacing={1}>{players}&nbsp;by{proposer}</Stack>}>
      <IconButton onClick={onClick} sx={{ padding:0, border:selected?'2px solid white':undefined, width:'15vh', height:'15vh', maxWidth:80, maxHeight:80, bgcolor:bgColor, '&:hover': {
        bgcolor: hoverColor, // Keep the background red on hover
      }}}>
        <Typography sx={{fontWeight:'bold'}}>{joshBluffed ? 'BLUFFED' : numPlayers}</Typography>
      </IconButton>
    </Tooltip>
  )
}

type Props = {
  // game_found: GameFound,
  // missions?: Missions,
  // selectedNode: NodeNumber|undefined,
}

export default function Nodes({}:Props){
  const selectedNode = useStore(state=>state.selectedNode);
  const setSelectedNode = useStore(state=>state.setSelectedNode);
  const game_found = useStore(state=>state.game?.game_found);
  const missions = useStore(state=>state.game?.missions);
  const game_players = useStore(state=>state.game?.game_players);
  const playHead = useStore(state=>state.playHead);
  const {settings} = useSettings();

  return (
    <Stack m={'10%'} height={'80vh'} maxHeight={'637px'} justifyContent={'space-between'}>
      {
        game_found?.MissionInfo.map((numPlayers, i)=>{
          let n = i+1 as NodeNumber;
          let hasHappened = checkHasHappened(missions?.[n]?.mission_phase_end?.log_time, playHead); //playHead && missions?.[n]?.mission_phase_end?.log_time ? missions[n]!.mission_phase_end!.log_time.valueOf() < playHead.valueOf() : true;
          // if( missions?.[n]?.mission_phase_end?.log_time && missions[n]!.mission_phase_end!.log_time.valueOf() > new Date('2024-04-07T20:01:48.000Z').valueOf() )
          //   return null;
          let proposerSlot = missions?.[n]?.mission_phase_end?.Proposer as PlayerSlot|undefined;
          let proposerName = hasHappened ? getPlayer(game_players, proposerSlot)?.Username : undefined;
          let proposerColor = hasHappened ? getPlayerColor(game_players, proposerSlot) : undefined;
          let playerSlots = missions?.[n]?.mission_phase_start?.Players as PlayerSlot[]|undefined;
          let coloredPlayers = hasHappened ? playerSlots?.map(p=>{
            let player = getPlayer(game_players, p);
            let color = getPlayerColor(game_players, player?.Slot as PlayerSlot|undefined);
            console.log(player?.Username, player?.Slot, color);
            return coloredText(player?.Username, color);
          }) : undefined
          let hacked = missions?.[n]?.mission_phase_end?.Failed
          return <Node key={n} joshBluffed={settings.josh_mode && n==1} hacked={ hasHappened ? hacked : undefined} numPlayers={numPlayers} proposer={ proposerName ? coloredText(proposerName, proposerColor) : undefined } players={coloredPlayers} selected={selectedNode === i+1} onClick={()=>setSelectedNode(n)} />
        })
      }
    </Stack>
  )
}