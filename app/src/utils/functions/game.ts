import { NodeNumber, PlayerSlot } from "@/types/game";
import { GamePlayer, GamePlayers, Missions, Proposal } from "@prisma/client";

// export function maxTurns(selectedNode:NodeNumber, players:GamePlayers){
//   let maxTurns = 1;
//   players && Object.keys(players).forEach( key=>{
//     if(players[key].proposals && players[key].proposals[selectedNode] && players[key].proposals[selectedNode].length > maxTurns)
//       maxTurns=parseInt(players[key].proposals[selectedNode].length);
//   });
//   return maxTurns;
// }

export function getPropIndex(turnInfo:Proposal){
  return turnInfo && turnInfo.select_phase_end ? ( turnInfo.select_phase_end.Passed ? turnInfo.select_phase_start.propNumber-2 : turnInfo.select_phase_start.propNumber-1 ) : undefined; //IMPORTANT CONVERSION FOR PROP TRANSITION
}

export function getHammerPlayerSlot(propIndex:number|undefined, selectedSlot:PlayerSlot|undefined, numPlayers:number){
  if(propIndex == undefined || selectedSlot == undefined)
    return undefined;
  return ( (4-propIndex) + selectedSlot ) % numPlayers as PlayerSlot
}

export function getTurnInfo(game_players:GamePlayers|undefined, selectedNode:NodeNumber|undefined, selectedTurn:number, selectedSlot:PlayerSlot|undefined){
  return game_players && selectedNode && selectedSlot!=undefined ? game_players[selectedSlot]?.proposals[selectedNode][selectedTurn-1] : undefined;
}

export function getPlayerAction(game_player:GamePlayer, selectedNode:NodeNumber|undefined, selectedTurn:number){
  return selectedNode ? game_player.proposals[selectedNode][selectedTurn-1] : undefined
}

export function maxTurns(selectedNode:NodeNumber, players:GamePlayers){
  let maxTurns = Object.entries(players).reduce((maxTurns, [key, player])=>{
    let currentTurns = player?.proposals[selectedNode].length;
    if(currentTurns !== undefined && currentTurns > maxTurns)
      return currentTurns
    return maxTurns;
  }, 1);
  return maxTurns;
}

export function logLineToISOTime(line:string){
  let formattedTimestamp = line.substring(0,19).replace(/\./g, '-').replace(' ', 'T') + "Z";
  return new Date(formattedTimestamp);
}

export function getCurrentNumProposals(game_players: GamePlayers, node:NodeNumber){
  let numProposals = 0;
  Object.values(game_players).forEach((game_player)=>{
    game_player && Object.values(game_player?.proposals).forEach(proposals=>{
      proposals.forEach(proposal=>{
        if(proposal.vote_phase_end && proposal.vote_phase_end.Passed==false && proposal.select_phase_start.Mission === node)
          ++numProposals
      }) //every time we find a vote_phase_end, increse the number of proposals
    })
  });
  return numProposals;
}

export function getCurrentMissionNumber(missions: Missions|null){
  let currentMission = 1 as NodeNumber;
  missions && Object.entries(missions).forEach(([missionNum, mission])=>{
    if(mission?.mission_phase_start)
      currentMission = parseInt(missionNum) as NodeNumber;
  });
  return currentMission;
}

export function getLatestProposal(game_players:GamePlayers, missionNum:NodeNumber){
  let result:{playerSlot:PlayerSlot, value:Proposal, proposalIndex:number}|undefined;
  Object.entries(game_players).forEach(([slot, game_player])=>{
    let playerSlot = parseInt(slot) as PlayerSlot;
    game_player?.proposals[missionNum].forEach((proposal, i)=>{
      if(!result)
        result = { playerSlot, value:proposal, proposalIndex:i}; //init
      else if(proposal.select_phase_start.log_time.valueOf() > result.value.select_phase_start.log_time.valueOf())
        result = {playerSlot, value:proposal, proposalIndex:i};
    })
  });
  return result;
}