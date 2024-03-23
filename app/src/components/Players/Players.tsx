import { NodeNumber, NumberOfPlayers, PlayerSlot } from "@/types/game";
import { GameEnd, GamePlayers } from "@prisma/client";
import Player from "./Player";
import { getHammerPlayerSlot, getPropIndex } from "@/utils/functions/game";
import { suspense } from "@/utils/hoc/suspense";
import { Box } from "@mui/material";
import { ColorCode, colors } from "@/utils/constants/colors";

type Props = {
  selectedNode: NodeNumber;
  selectedTurn: number; //1..many
  selectedSlot: PlayerSlot;
  game_players: GamePlayers;
  game_end?: GameEnd;
}

export default function Players({selectedNode, selectedTurn, selectedSlot, game_players, game_end }:Props){
  const turnInfo = game_players[selectedSlot]?.proposals[selectedNode][selectedTurn-1];
  let propSlot = turnInfo && getPropIndex(turnInfo);
  let numPlayers = Object.keys(game_players).length as NumberOfPlayers;
  
  return (
    <Box id="players-container" position='relative' width='100%' height='100%'>
    {
      Object.entries(game_players).map(([k, game_player])=>{
        if(!game_player)
          return null;
        let slot = game_player.Slot as PlayerSlot;
        const playerIdentity = game_end?.PlayerIdentities.find(pi=>pi.Slot == slot);

        const playerAction = game_player.proposals[selectedNode][selectedTurn-1];
        let hammerPlayerSlot = propSlot && getHammerPlayerSlot(propSlot, selectedSlot, numPlayers);
        const vote = turnInfo?.vote_phase_end.VotesFor.includes(slot) ? 'accept' : 'refuse';
        return (
          <Player 
            key={k} 
            slot={game_player.Slot as PlayerSlot}
            numPlayers={numPlayers}
            username={game_player.Username}
            color={colors[game_player.Color as ColorCode].hex}
            playerIdentity={playerIdentity}
            hasAction={playerAction!==undefined}
            selected={slot === selectedSlot}
            hasHammer={slot === hammerPlayerSlot}
            isDisconnected={false}
            vote={vote}
            highlighted={turnInfo?.SelectedTeam.includes(slot)}
          />
        );
      })
    }
    </Box>
  )
}