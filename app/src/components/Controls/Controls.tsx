"use client";
import { PlayerSlot } from "@/types/game";
import { ColorCode, colors } from "@/utils/constants/colors";
import { getColoredUsername, getHappeningMission, getLatestProposal, isHappening } from "@/utils/functions/game";
import { insertBetween } from "@/utils/functions/general";
import { coloredText } from "@/utils/functions/jsx";
import { useStore } from "@/zustand/store";
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import MissionControls from "./MissionControls";
import { Mission } from "@prisma/client";
import VoteControls from "./VoteControls";

export default function Controls(){
  const missions = useStore(state=>state.game?.missions);
  const game_players = useStore(state=>state.game?.game_players);
  const game_found = useStore(state=>state.game?.game_found);
  const selectedNode = useStore(state=>state.selectedNode);
  const playHead = useStore(state=>state.playHead);
  const localPlayer = game_players && Object.values(game_players).find(gp=>gp?.IsLocal===true);
  const hacker = localPlayer ? game_found?.Hackers.includes(localPlayer.Slot) : false;
  const happeningMission = getHappeningMission(missions, playHead);
  const inMission = localPlayer ? happeningMission?.mission_phase_start.Players.includes(localPlayer.Slot) : false;
  const latestProposal = game_players && selectedNode!=undefined && getLatestProposal(game_players, selectedNode, playHead)?.value || undefined;
  const isVoting = isHappening(latestProposal?.vote_phase_start?.log_time, playHead, latestProposal?.vote_phase_end?.log_time);
  return (
    <>
      <MissionControls mission={happeningMission} inMission={inMission} isHacker={hacker} />
      <VoteControls proposal={isVoting && latestProposal || undefined} />
    </>
  )
}