"use client";
import { NodeNumber, NumberOfPlayers, PlayerSlot } from "@/types/game";
import { ColorCode, colors } from "@/utils/constants/colors";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { GamePlayer, GamePlayers } from "@prisma/client";
import {coloredText} from '@/utils/functions/jsx'
import { getHammerPlayerSlot, getPropIndex, getTurnInfo, hasHappened } from "@/utils/functions/game";
import style from './importantinfo.module.css';
import { useStore } from "@/zustand/store";
type Props = {
  // selectedNode: NodeNumber|undefined;
  // selectedTurn: number; //1..many
  // selectedSlot: PlayerSlot|undefined;
  // game_players: GamePlayers;
  // numPlayers: NumberOfPlayers;
}

function trueMod(n:number, m:number) {
  return ((n % m) + m) % m;
}

function numSuffix(num:number){
  let numMod100 = num%100;
  switch(num%10){
      case 1:
        return num + (numMod100===11 ? 'th' : 'st');
      case 2:
        return num + (numMod100===12 ? 'th' : 'nd');
      case 3:
        return num + (numMod100===13 ? 'th' : 'rd');
      default: return num + 'th'
  }
}

export default function ImportantInfo({}:Props){
  const selectedNode = useStore(state=>state.selectedNode);
  const selectedSlot = useStore(state=>state.selectedSlot);
  const selectedTurn = useStore(state=>state.selectedTurn);
  const playHead = useStore(state=>state.playHead);
  const game_players = useStore(state=>state.game?.game_players);
  const numPlayers = useStore(state=>state.game?.game_found.PlayerNumber as NumberOfPlayers|undefined);
  const turnInfo = getTurnInfo(game_players, selectedNode, selectedTurn, selectedSlot)
  const proposerSlot = turnInfo?.select_phase_start?.Player as PlayerSlot | undefined;
  const proposer = game_players && proposerSlot!=undefined ? game_players[proposerSlot] as GamePlayer : undefined;
  const proposerColor = proposer && colors[proposer.Color as ColorCode].hex
  const nth = numSuffix(selectedTurn);
  const action = turnInfo?.select_phase_end?.Passed===undefined ? 'is proposing' : turnInfo.select_phase_end.Passed===true ? 'passed hammer' : 'proposed';
  const targets:React.ReactNode[] = [];
  if(turnInfo && game_players && numPlayers!=undefined)
    if(turnInfo.select_phase_end?.Passed){
      let propIndex = getPropIndex(turnInfo); //IMPORTANT CONVERSION FOR PROP TRANSITION
      let hammerPlayerSlot = getHammerPlayerSlot(propIndex, selectedSlot!, numPlayers); //IMPORTANT: hammer is who they pass it to
      let fromPlayerIndex = hammerPlayerSlot!=undefined ? trueMod(hammerPlayerSlot-1, numPlayers) as PlayerSlot : undefined;
      let fromPlayer = fromPlayerIndex!=undefined ? game_players[fromPlayerIndex] : undefined;
      let fromPlayerColor = fromPlayer ? colors[fromPlayer.Color as ColorCode]?.hex : undefined;
      let fromPlayerText = coloredText(fromPlayer?.Username, fromPlayerColor, 'fromText');
      // let toPlayerIndex = trueMod(hammerPlayerSlot-1, numPlayers) as PlayerSlot;
      let toPlayer = hammerPlayerSlot!=undefined ? game_players[hammerPlayerSlot] : undefined;
      let toPlayerColor = toPlayer ? colors[toPlayer.Color as ColorCode]?.hex : undefined;
      let toPlayerText = coloredText(toPlayer?.Username, toPlayerColor, 'toText');
      // targets.push(`from ${fromPlayerText} to ${toPlayerText}`)
      targets.push(<span key='from'>{'from '}</span>);
      targets.push(fromPlayerText);
      targets.push(<span key='to'>{' to '}</span>);
      targets.push(toPlayerText);
    }
    else{
      let proposedPlayerSlots = turnInfo.select_phase_end?.SelectedTeam as PlayerSlot[] | undefined;
      proposedPlayerSlots?.forEach((playerSlot, index)=>{
        targets.push( coloredText(game_players[playerSlot]?.Username+' ', colors[game_players[playerSlot]?.Color as ColorCode]?.hex, index) );
      });
    }
  return (
    <Box className={style.container}>
      <Box className={style.left} component={Paper}>
        <Typography visibility={!proposer ? 'hidden':undefined}>{coloredText(proposer?.Username, proposerColor)}'s</Typography>
        <Typography visibility={!proposer ? 'hidden':undefined}>{nth} turn</Typography>
      </Box>
      <Box className={style.center} sx={{backgroundColor:'#909090'}} component={Paper}>
        <Typography>node</Typography>
        <Typography variant="h3">{selectedNode}</Typography>
      </Box>
      <Box className={style.right} component={Paper}>
        <Typography>{turnInfo && action}</Typography>
        <Typography>{targets}</Typography>
      </Box>
    </Box>
  )
}