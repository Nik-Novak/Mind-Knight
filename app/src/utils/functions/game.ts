import { NodeNumber, PlayerSlot } from "@/types/game";
import { GamePlayer, GamePlayers, Mission, Missions, Proposal, SelectUpdate } from "@prisma/client";
import { ColorCode, colors } from "../constants/colors";
import { coloredText } from "./jsx";
import { Key } from "react";

// export function maxTurns(selectedNode:NodeNumber, players:GamePlayers){
//   let maxTurns = 1;
//   players && Object.keys(players).forEach( key=>{
//     if(players[key].proposals && players[key].proposals[selectedNode] && players[key].proposals[selectedNode].length > maxTurns)
//       maxTurns=parseInt(players[key].proposals[selectedNode].length);
//   });
//   return maxTurns;
// }

export function getPropIndex(turnInfo:Proposal){
  return turnInfo ? ( turnInfo.select_phase_end?.Passed ? turnInfo.select_phase_start.propNumber-2 : turnInfo.select_phase_start.propNumber-1 ) : undefined; //IMPORTANT CONVERSION FOR PROP TRANSITION
}

export function getHammerPlayerSlot(propIndex:number|undefined, selectedSlot:PlayerSlot|undefined, numPlayers:number){
  if(propIndex == undefined || selectedSlot == undefined)
    return undefined;
  return ( (4-propIndex) + selectedSlot ) % numPlayers as PlayerSlot
}

export function getTurnInfo(game_players:GamePlayers|undefined, selectedNode:NodeNumber|undefined, selectedTurn:number, selectedSlot:PlayerSlot|undefined, playHead?:number){
  return game_players && selectedNode && selectedSlot!=undefined /*&& hasHappened(game_players[selectedSlot]?.proposals[selectedNode][selectedTurn-1].select_phase_start.log_time, playHead)*/ ? game_players[selectedSlot]?.proposals[selectedNode][selectedTurn-1] : undefined;
}

export function getPlayerAction(game_player:GamePlayer|null, selectedNode:NodeNumber|undefined, selectedTurn:number, playhead?:number){
  if(!game_player) return undefined;
  let action = selectedNode ? game_player.proposals[selectedNode]?.[selectedTurn-1] : undefined
  if(playhead!==undefined && action){
    if(!hasHappened(action.select_phase_start.log_time, playhead))
      action=undefined;
  }
  return action;
}


export function maxTurns(selectedNode:NodeNumber|undefined, players:GamePlayers, playhead?:number){
  if(!selectedNode)
    return 1;
  let maxTurns = Object.entries(players).reduce((maxTurns, [key, player])=>{
    let currentTurns = player?.proposals[selectedNode];
    if(playhead!==undefined)
      currentTurns = currentTurns?.filter(t=>t.select_phase_start.log_time.valueOf() <= playhead.valueOf());
    let numTurns = currentTurns?.length;
    if(numTurns !== undefined && numTurns > maxTurns)
      return numTurns
    return maxTurns;
  }, 1);
  return maxTurns;
}

export function logLineToISOTime(line:string, depth=0){
  let formattedTimestamp = line.substring(0,19).replace(/\./g, '-').replace(' ', 'T');// + "Z";
  let [datePart, timePart] = formattedTimestamp.split('T');//[1].replaceAll('-',':') + "Z";
  formattedTimestamp = datePart +"T"+ timePart.replaceAll('-', ':') + "Z";
  let date = new Date(formattedTimestamp);
  if(isNaN(date.valueOf())){
    console.log('INVALID TIMESTAMP:', formattedTimestamp);
    console.log('\tTIMESTAMP LINE:', formattedTimestamp);
    console.log('RETRYING WITH FIRST CHARACTER RESTORED:', '2'+formattedTimestamp);
    if(depth==0)
      return logLineToISOTime('2'+formattedTimestamp, 1);
    else throw Error("INVALID TIMESTAMP: "+formattedTimestamp)
  }
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

export function getCurrentMissionNumber(missions: Missions|null|undefined, playhead?:number){
  let currentMission = 0// as NodeNumber;
  missions && Object.entries(missions).forEach(([missionNum, mission])=>{
    if(mission?.mission_phase_start){
      if(playhead===undefined || mission.mission_phase_start.log_time.valueOf() <= playhead.valueOf())
        currentMission = parseInt(missionNum) as NodeNumber;
    }
  });
  return currentMission + 1 as NodeNumber;
}

// export function getLatestProposal(game_players:GamePlayers, missionNum:NodeNumber, playHead?:Date){
//   let result:{playerSlot:PlayerSlot, value:Proposal, proposalIndex:number}|undefined;
//   Object.entries(game_players).forEach(([slot, game_player])=>{
//     let playerSlot = parseInt(slot) as PlayerSlot;
//     game_player?.proposals[missionNum]?.forEach((proposal, i)=>{
//       if(!result || proposal.select_phase_start.log_time.valueOf() > result.value.select_phase_start.log_time.valueOf())
//         if(hasHappened(proposal.select_phase_start.log_time, playHead))
//           result = {playerSlot, value:proposal, proposalIndex:i};
//     })
//   });
//   return result;
// }
export function getLatestProposal(game_players:GamePlayers, missionNum:NodeNumber, playhead?:number){
  let result:{playerSlot:PlayerSlot, value:Proposal, proposalIndex:number}|undefined;
  Object.entries(game_players).forEach(([slot, game_player])=>{
    let playerSlot = parseInt(slot) as PlayerSlot;
    game_player?.proposals[missionNum]?.forEach((proposal, i)=>{
      if(!result || proposal.select_phase_start.created_at.valueOf() > result.value.select_phase_start.created_at.valueOf())
        if(hasHappened(proposal.select_phase_start.log_time, playhead))
          result = {playerSlot, value:proposal, proposalIndex:i};
    })
  });
  return result;
}
// export function getLatestProposal(game_players:GamePlayers,numPlayers:number, missions:Missions, missionNum:NodeNumber, playHead?:Date){
//   let latestTurnIndex = maxTurns(missionNum, game_players) -1;
//   let anyLatestTurnProposal = Object.values(game_players).find(g=>g?.proposals[missionNum][latestTurnIndex])?.proposals[missionNum][latestTurnIndex];
//   if(!anyLatestTurnProposal)
//     throw Error("Something went wrong, should have found a proposal...");
//   function traceProposals(current:Proposal, turnIndex:number, traceCount:number=1){
//     if(traceCount > numPlayers){ //special case for when there's a full circle of props. In this case, we have to know the starting proposer.
//       let lastMission = Math.max(missionNum-1, 1) as NodeNumber;
//       let lastMissionProposer = missions[lastMission]?.mission_phase_end?.Proposer as PlayerSlot|undefined;
//       if(!lastMissionProposer)
//         lastMissionProposer = 0;
//       let latestProposal = game_players[lastMissionProposer]?.proposals[missionNum][latestTurnIndex];
//       if(!latestProposal)
//         throw Error("Somethign went wrong, there's no way we shouldn't have a proposal here.");
//       console.log('WE WENT FULL CIRCLE, last proposer:', lastMissionProposer);
//       return {playerSlot:current.select_phase_start.Player as PlayerSlot, value:current, proposalIndex:turnIndex}
//     }
//     console.log('CURRENT PROPOSAL:');
//     console.log('\tproposer:', current.select_phase_start.Player);
//     console.log('\tselect_phase_start:', current.select_phase_start);
//     console.log('\select_phase_end:', current.select_phase_end);
//     let nextPlayer = current.select_phase_start.NextPlayer as PlayerSlot;
//     let nextProposal = game_players[nextPlayer]?.proposals[missionNum][turnIndex];
//     if(nextProposal)
//       return traceProposals(nextProposal, turnIndex, traceCount+1); //dig deeper to the next proposal
//     else
//       return {playerSlot:current.select_phase_start.Player as PlayerSlot, value:current, proposalIndex:turnIndex}; //otherwise there's no newer proposal. Return current;
//   }
//   return traceProposals(anyLatestTurnProposal, latestTurnIndex);
// }
// export function getLatestProposal(game_players:GamePlayers, missions:Missions, missionNum:NodeNumber, playHead?:Date){
//   let lastMission = Math.max(missionNum-1, 1) as NodeNumber;
//   let proposerOfLastMission = missions[lastMission]?.mission_phase_end?.Proposer as PlayerSlot|undefined;
//   if(!proposerOfLastMission)
//     proposerOfLastMission = 0;
//   let lastMissionProposerProposals = game_players[proposerOfLastMission]?.proposals[lastMission];
//   let firstProposalOfMission:Proposal;
//   if(!lastMissionProposerProposals){
//     console.log('NODE 1 DETECTED, default to first player first prop');
//     firstProposalOfMission = game_players[0]?.proposals[1]![0]!; //has to be node 1 the first players first prop
//   }
//   else { //otherwise get the next players first proposal of this node
//     let nextPlayer = lastMissionProposerProposals[lastMissionProposerProposals.length-1].select_phase_start.NextPlayer as PlayerSlot
//     let fpom = game_players[nextPlayer]?.proposals[missionNum][0];
//     if(!fpom)
//       throw Error("There should be a proposal for this player... Since they're next in line after the last mission");
//     firstProposalOfMission = fpom;
//   }

//   function traceProposals(current:Proposal, initialMissionProposer:PlayerSlot, turnIndex:number=0){
//     console.log('CURRENT PROPOSAL:');
//     console.log('\tproposer:', current.select_phase_start.Player);
//     console.log('\tselect_phase_start:', current.select_phase_start);
//     console.log('\select_phase_end:', current.select_phase_end);
//     let nextPlayer = current.select_phase_start.NextPlayer as PlayerSlot;
//     let newTurnIndex = nextPlayer === initialMissionProposer ? turnIndex+1 : turnIndex; //increment turns if we wnt all the way around
//     let nextProposal = game_players[nextPlayer]?.proposals[missionNum][newTurnIndex];
//     if(nextProposal)
//       return traceProposals(nextProposal, initialMissionProposer, newTurnIndex); //dig deeper to the next proposal
//     else
//       return {playerSlot:current.select_phase_start.Player as PlayerSlot, value:current, proposalIndex:turnIndex}; //otherwise there's no newer proposal. Return current;
//   }

//   return traceProposals(firstProposalOfMission, firstProposalOfMission.select_phase_start.Player as PlayerSlot);
// }

export function hasHappened(log_time:Date|number|undefined, playhead:number|undefined, expiresAfter:number=0):boolean{
  if(playhead===undefined ) return true;
  if(log_time===undefined) return false;
  let isBeforePlayhead = log_time.valueOf() <= playhead;
  if(isBeforePlayhead && expiresAfter)
    return (playhead - expiresAfter) <= log_time.valueOf(); //check for expiration
  return isBeforePlayhead; //otherwise just return isBeforePlayhead result
}

export function isHappening(start_log_time:Date|number|undefined, playhead:number|undefined, end_log_time:Date|number|undefined, end_buffer=0){
  if(start_log_time===undefined || end_log_time===undefined || playhead===undefined) return false;
  return hasHappened(start_log_time, playhead, end_log_time.valueOf()-start_log_time.valueOf() + end_buffer); //otherwise just return isBeforePlayhead result
}

export function getLatestSelectUpdate(turnInfo:Proposal|undefined, playhead?:number){
  if(!turnInfo) return undefined;
  let latest:SelectUpdate|undefined;
  turnInfo.select_updates.forEach(selectUpdate=>{
    if(!latest || selectUpdate.log_time.valueOf() > latest.log_time.valueOf())
      if(hasHappened(selectUpdate.log_time, playhead))
        latest = selectUpdate;
  });
  return latest;
}

export function getPlayerColor(game_players?:GamePlayers, slot?:PlayerSlot){
  if(!game_players || slot === undefined) return undefined;
  let colorCode = game_players?.[slot]?.Color as ColorCode|undefined
  if(colorCode === undefined) return undefined;
  let proposerColor = colors[ colorCode ].hex
  return proposerColor;
}

export function getPlayer(game_players?:GamePlayers, slot?:PlayerSlot){
  if(slot===undefined || !game_players) return undefined
  return game_players[slot];
}

export function getHappeningMission(missions?:Missions, playhead?:number, afterMissionBuffer=5000){
  return missions && Object.values(missions).reduce<Mission|undefined>((accum, mission)=>{
    if(accum)
      return accum;
    return isHappening(mission?.mission_phase_start.log_time, playhead, mission?.mission_phase_end?.log_time.valueOf(), afterMissionBuffer) && mission || undefined;
  }, undefined);
}

export function getColoredUsername(game_players:GamePlayers, slot:PlayerSlot, key?: Key){
  let game_player = game_players[slot];
  let color = game_player?.Color!=undefined ? colors[game_player.Color as ColorCode].hex : '#fff'
  return coloredText(game_player?.Username, color, key);
}
