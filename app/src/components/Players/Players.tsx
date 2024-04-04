"use client";
import { NodeNumber, NumberOfPlayers, PlayerSlot } from "@/types/game";
import type { GameEnd, GamePlayers, Player as PlayerData, PlayerIdentity } from "@prisma/client"; //TODO fiix figuring out typing on clientside
import Player from "./Player";
import { getHammerPlayerSlot, getPlayerAction, getPropIndex, getTurnInfo } from "@/utils/functions/game";
import { suspense } from "@/utils/hoc/suspense";
import { Box } from "@mui/material";
import { ColorCode, colors } from "@/utils/constants/colors";
import { Suspense } from "react";
import PlayerSkeleton from "./PlayerSkeleton";
import { useStore } from "@/zustand/store";
import { database } from "@/utils/database";

type Props = {
  // getDbPlayer: (playerIdentity: PlayerIdentity)=> Promise<PlayerData>
  // selectedNode: NodeNumber|undefined;
  // selectedTurn: number; //1..many
  // selectedSlot: PlayerSlot|undefined;
  // numPlayers: NumberOfPlayers;
  // game_players: GamePlayers;
  // game_end?: GameEnd;
}

export default function Players({ }:Props){
  const { selectedNode, selectedSlot, selectedTurn } = useStore();
  const game_players = useStore(state=>state.game?.game_players);
  const game_end = useStore(state=>state.game?.game_end);
  const numPlayers = useStore(state=>state.game?.game_found.PlayerNumber as NumberOfPlayers|undefined);
  // const { selectedNode, selectedSlot, selectedTurn } = useControlsStore.getState()
  const turnInfo = getTurnInfo(game_players, selectedNode, selectedTurn, selectedSlot);
  let propSlot = turnInfo && getPropIndex(turnInfo);

  console.log('REFRESH', selectedSlot);
  
  return (
    <Box id="players-container" position='relative' width='100%' height='100%'>
    {
      game_players && Object.entries(game_players).map(([k, game_player])=>{
        if(!game_player)
          return null;
        let slot = game_player.Slot as PlayerSlot;
        const playerIdentity = game_end?.PlayerIdentities.find(pi=>pi.Slot == slot);

        const playerAction = getPlayerAction(game_player, selectedNode, selectedTurn);
        let hammerPlayerSlot = numPlayers!=undefined && getHammerPlayerSlot(propSlot, selectedSlot, numPlayers);
        const accepted = turnInfo?.vote_phase_end?.VotesFor.includes(slot);
        let proppedIndex = playerAction && playerAction.select_phase_start.propNumber -1;
        return (
          // <Suspense key={k} fallback={<PlayerSkeleton key={k} slot={slot} numPlayers={numPlayers} />} >
            <Player 
              key={k} 
              slot={slot}
              numPlayers={numPlayers || 5}
              username={game_player.Username}
              color={colors[game_player.Color as ColorCode].hex}
              playerIdentity={playerIdentity}
              hasAction={playerAction!==undefined}
              selected={slot === selectedSlot}
              hasHammer={slot === hammerPlayerSlot}
              isDisconnected={false}
              accepted={accepted}
              proppedIndex={playerAction && !playerAction.select_phase_end?.Passed && proppedIndex || undefined}
              highlighted={turnInfo?.select_phase_end?.SelectedTeam.includes(slot)}
            />
          // </Suspense>
        );
      })
    }
    </Box>
  )
}