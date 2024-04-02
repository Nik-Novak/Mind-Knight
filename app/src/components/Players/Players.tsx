import { NodeNumber, NumberOfPlayers, PlayerSlot } from "@/types/game";
import { GameEnd, GamePlayers } from "@prisma/client";
import Player from "./Player";
import { getHammerPlayerSlot, getPlayerAction, getPropIndex, getTurnInfo } from "@/utils/functions/game";
import { suspense } from "@/utils/hoc/suspense";
import { Box } from "@mui/material";
import { ColorCode, colors } from "@/utils/constants/colors";
import { Suspense } from "react";
import PlayerSkeleton from "./PlayerSkeleton";

type Props = {
  selectedNode: NodeNumber|undefined;
  selectedTurn: number; //1..many
  selectedSlot: PlayerSlot|undefined;
  numPlayers: NumberOfPlayers;
  game_players: GamePlayers;
  game_end?: GameEnd;
}

export default function Players({selectedNode, selectedTurn, selectedSlot, numPlayers, game_players, game_end }:Props){
  const turnInfo = getTurnInfo(game_players, selectedNode, selectedTurn, selectedSlot);
  let propSlot = turnInfo && getPropIndex(turnInfo);
  
  return (
    <Box id="players-container" position='relative' width='100%' height='100%'>
    {
      Object.entries(game_players).map(([k, game_player])=>{
        if(!game_player)
          return null;
        let slot = game_player.Slot as PlayerSlot;
        const playerIdentity = game_end?.PlayerIdentities.find(pi=>pi.Slot == slot);

        const playerAction = getPlayerAction(game_player, selectedNode, selectedTurn);
        let hammerPlayerSlot = getHammerPlayerSlot(propSlot, selectedSlot, numPlayers);
        const accepted = turnInfo?.vote_phase_end?.VotesFor.includes(slot);
        let proppedIndex = playerAction && playerAction.propNumber -1;
        return (
          <Suspense key={k} fallback={<PlayerSkeleton key={k} slot={slot} numPlayers={numPlayers} />} >
            <Player 
              key={k} 
              slot={slot}
              numPlayers={numPlayers}
              username={game_player.Username}
              color={colors[game_player.Color as ColorCode].hex}
              playerIdentity={playerIdentity}
              hasAction={playerAction!==undefined}
              selected={slot === selectedSlot}
              hasHammer={slot === hammerPlayerSlot}
              isDisconnected={false}
              accepted={accepted}
              proppedIndex={proppedIndex}
              highlighted={turnInfo?.SelectedTeam.includes(slot)}
            />
          </Suspense>
        );
      })
    }
    </Box>
  )
}