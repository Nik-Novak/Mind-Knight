import { NodeNumber, PlayerSlot } from "@/types/game";
import { GamePlayer, GamePlayers, Proposal } from "@prisma/client";

// export function maxTurns(selectedNode:NodeNumber, players:GamePlayers){
//   let maxTurns = 1;
//   players && Object.keys(players).forEach( key=>{
//     if(players[key].proposals && players[key].proposals[selectedNode] && players[key].proposals[selectedNode].length > maxTurns)
//       maxTurns=parseInt(players[key].proposals[selectedNode].length);
//   });
//   return maxTurns;
// }

export function getPropIndex(turnInfo:Proposal){
  return turnInfo && ( turnInfo.Passed ? turnInfo.propNumber-2 : turnInfo.propNumber-1 ); //IMPORTANT CONVERSION FOR PROP TRANSITION
}

export function getHammerPlayerSlot(propIndex:number|undefined, selectedSlot:PlayerSlot|undefined, numPlayers:number){
  if(propIndex == undefined || selectedSlot == undefined)
    return undefined;
  return ( (4-propIndex) + selectedSlot ) % numPlayers as PlayerSlot
}

export function getTurnInfo(game_players:GamePlayers, selectedNode:NodeNumber|undefined, selectedTurn:number, selectedSlot:PlayerSlot|undefined){
  return selectedNode && selectedSlot!=undefined ? game_players[selectedSlot]?.proposals[selectedNode][selectedTurn-1] : undefined;
}

export function getPlayerAction(game_player:GamePlayer, selectedNode:NodeNumber|undefined, selectedTurn:number){
  return selectedNode ? game_player.proposals[selectedNode][selectedTurn-1] : undefined
}