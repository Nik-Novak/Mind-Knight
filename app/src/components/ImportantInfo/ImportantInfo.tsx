import { NodeNumber, NumberOfPlayers, PlayerSlot } from "@/types/game";
import { ColorCode, colors } from "@/utils/constants/colors";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { GamePlayer, GamePlayers } from "@prisma/client";
import {coloredText} from '@/utils/functions/jsx'
import { getHammerPlayerSlot, getPropIndex, getTurnInfo } from "@/utils/functions/game";
import style from './importantinfo.module.css';
type Props = {
  selectedNode: NodeNumber|undefined;
  selectedTurn: number; //1..many
  selectedSlot: PlayerSlot|undefined;
  game_players: GamePlayers;
  numPlayers: NumberOfPlayers;
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

export default function ImportantInfo({selectedNode, selectedTurn, selectedSlot, game_players, numPlayers}:Props){
  const turnInfo = getTurnInfo(game_players, selectedNode, selectedTurn, selectedSlot)
  const proposerSlot = turnInfo?.Proposer as PlayerSlot | undefined;
  const proposer = proposerSlot ? game_players[proposerSlot] as GamePlayer : undefined;
  const proposerColor = proposer && colors[proposer.Color as ColorCode].hex
  const nth = numSuffix(selectedTurn);
  const action = turnInfo?.Passed ? 'passed hammer' : 'proposed';
  const targets:React.ReactNode[] = [];
  if(turnInfo)
    if(turnInfo.Passed){
      let propIndex = getPropIndex(turnInfo); //IMPORTANT CONVERSION FOR PROP TRANSITION
      let hammerPlayerSlot = getHammerPlayerSlot(propIndex, selectedSlot!, numPlayers); //IMPORTANT: hammer is who they pass it to
      let fromPlayerIndex = hammerPlayerSlot!=undefined ? trueMod(hammerPlayerSlot-1, numPlayers) as PlayerSlot : undefined;
      let fromPlayer = fromPlayerIndex!=undefined ? game_players[fromPlayerIndex] : undefined;
      let fromPlayerColor = fromPlayer ? colors[fromPlayer.Color as ColorCode]?.hex : undefined;
      let fromPlayerText = coloredText(fromPlayer?.Username, fromPlayerColor);
      // let toPlayerIndex = trueMod(hammerPlayerSlot-1, numPlayers) as PlayerSlot;
      let toPlayer = hammerPlayerSlot ? game_players[hammerPlayerSlot] : undefined;
      let toPlayerColor = toPlayer ? colors[toPlayer.Color as ColorCode]?.hex : undefined;
      let toPlayerText = coloredText(toPlayer?.Username, toPlayerColor);
      targets.push('from ');
      targets.push(fromPlayerText);
      targets.push(' to ');
      targets.push(toPlayerText);
    }
    else{
      let proposedPlayerSlots = turnInfo.SelectedTeam as PlayerSlot[];
      proposedPlayerSlots.forEach((playerSlot, index)=>{
        targets.push( coloredText(game_players[playerSlot]?.Username+' ', colors[game_players[playerSlot]?.Color as ColorCode]?.hex) );
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
        <Typography>{action}</Typography>
        <Typography>{targets}</Typography>
      </Box>
    </Box>
  )
}