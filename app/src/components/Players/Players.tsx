"use client";
import { NumberOfPlayers, PlayerRole, PlayerSlot } from "@/types/game";
import Player from "./Player";
import { getHammerPlayerSlot, getLatestSelectUpdate, getPlayerAction, getPropIndex, getTurnInfo, hasHappened } from "@/utils/functions/game";
import { Box } from "@mui/material";
import { ColorCode, colors } from "@/utils/constants/colors";
import { useStore } from "@/zustand/store";
import { useSettings } from "../SettingsProvider";

type Props = {
}

export default function Players({ }:Props){
  const selectedNode = useStore(state=>state.selectedNode);
  const selectedSlot = useStore(state=>state.selectedSlot);
  const selectedTurn = useStore(state=>state.selectedTurn);
  const chat = useStore(state=>state.game?.chat);
  const playHead = useStore(state=>state.playHead);
  const game_players = useStore(state=>state.game?.game_players);
  const game_end = useStore(state=>state.game?.game_end);
  const numPlayers = useStore(state=>state.game?.game_found.PlayerNumber as NumberOfPlayers|undefined);
  const {settings} = useSettings();
  const turnInfo = getTurnInfo(game_players, selectedNode, selectedTurn, selectedSlot, playHead);
  let propSlot = turnInfo && getPropIndex(turnInfo);
  
  return (
    <Box id="players-container" position='relative' width='100%' height='100%'>
    {
      game_players && Object.entries(game_players).map(([k, game_player])=>{
        if(!game_player)
          return null;
        let slot = game_player.Slot as PlayerSlot;
        const playerIdentity = game_end?.PlayerIdentities.find(pi=>pi.Slot == slot);
        const playerAction = getPlayerAction(game_player, selectedNode, selectedTurn, playHead);
        let hammerPlayerSlot = numPlayers!=undefined && getHammerPlayerSlot(propSlot, selectedSlot, numPlayers);
        const accepted = hasHappened(turnInfo?.vote_phase_end?.log_time, playHead) ? turnInfo?.vote_phase_end?.VotesFor.includes(slot) : undefined;
        let proppedIndex = playerAction && playerAction.select_phase_start.propNumber -1;
        let isPropped =  hasHappened(turnInfo?.select_phase_end?.log_time, playHead) && turnInfo?.select_phase_end?.SelectedTeam.includes(slot);
        let isShadowed = getLatestSelectUpdate(turnInfo, playHead)?.Slots.includes(slot);
        let msg = chat?.findLast(m=>m.Slot === slot && hasHappened(m.log_time, playHead, 5000));
        let typing = game_player.chat_updates.findLast(tu=>tu.Slot === slot && hasHappened(tu.log_time, playHead))?.Typing;
        let role = settings.streamer_mode ? undefined : game_end?.Roles.find(r=>r.Slot === slot)?.Role as PlayerRole;

        return (
          // <Suspense key={k} fallback={<PlayerSkeleton key={k} slot={slot} numPlayers={numPlayers} />} >
            <Player 
              key={k} 
              slot={slot}
              role={role}
              numPlayers={numPlayers || 5}
              username={game_player.Username}
              color={colors[game_player.Color as ColorCode].hex}
              playerIdentity={playerIdentity}
              hasAction={playerAction!==undefined}
              selected={slot === selectedSlot}
              hasHammer={slot === hammerPlayerSlot}
              isDisconnected={false}
              accepted={accepted}
              proppedIndex={playerAction && !playerAction.select_phase_end?.Passed && proppedIndex!=undefined ? proppedIndex : undefined}
              isPropped={isPropped}
              isShadowed={isShadowed}
              chatMsg={msg?.Message}
              skin={settings.josh_mode ? 'skin_holo_san' : game_player.Skin}
              typing={typing}
            />
          // </Suspense>
        );
      })
    }
    </Box>
  )
}