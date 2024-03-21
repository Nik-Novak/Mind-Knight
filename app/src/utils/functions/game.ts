import { PlayerSlot } from "@/types/game";
import { Proposal } from "@prisma/client";

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

export function getHammerPlayerSlot(propIndex:number, selectedSlot:PlayerSlot, numPlayers:number){
  return ( (4-propIndex) + selectedSlot ) % numPlayers as PlayerSlot
}