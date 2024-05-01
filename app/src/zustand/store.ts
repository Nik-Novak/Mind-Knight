import { NodeNumber, PlayerSlot } from "@/types/game"
import { getCurrentMissionNumber, getLatestProposal, getPlayerAction, hasHappened, maxTurns } from "@/utils/functions/game";
import { clamp } from "@/utils/functions/general";
import { Game } from "@prisma/client";
import { create } from 'zustand'

type Store = {
  game: Game|undefined,
  selectedNode: NodeNumber|undefined,
  selectedTurn: number,
  selectedSlot: PlayerSlot|undefined,
  playhead: number, //offset from game_found.log_time
  setGame: (game:Game|undefined)=>void,
  setSelectedNode: (selectedNode:NodeNumber|undefined)=>void,
  setSelectedTurn: (selectedTurn:number)=>void,
  setSelectedSlot: (selectedSlot:PlayerSlot|undefined)=>void,
  setPlayhead: (playhead:number)=>void,
  incrementPlayhead: (by?:number, limits?:[number|undefined, number|undefined], loop?:boolean)=>void
}



export const useStore = create<Store>((set)=>({
  game: undefined,
  selectedNode: undefined,
  selectedTurn: 1,
  selectedSlot: undefined,
  playhead: 0, //offset from game_found.log_time
  setGame: (game:Game|undefined)=>set(state=>({game})),
  setSelectedNode: (newNode:NodeNumber|undefined)=>set(state=>{
    if(newNode === undefined) 
      return ({selectedNode: newNode})
    let currentMission = getCurrentMissionNumber(state.game?.missions);
    if(state.game && newNode <= currentMission){ //node exists
      let prevNode = Math.max(newNode-1, 1) as NodeNumber;
      if( state.game.missions[prevNode]?.mission_phase_start ){
        let newMaxTurns = maxTurns(newNode, state.game.game_players);
        let selectedTurn = Math.min(newMaxTurns, state.selectedTurn, 1); //ensuring turn exists
        let newPlayhead = state.game.missions[newNode]?.mission_phase_end?.log_time.valueOf() || state.game.latest_log_time.valueOf();
        return ({selectedNode: newNode, selectedTurn, playhead:newPlayhead});
      }
    }
    return state; //default no changes
  }),
  setSelectedTurn: (selectedTurn:number)=>set(state=>({selectedTurn})),
  setSelectedSlot: (selectedSlot:PlayerSlot|undefined)=>set(state=>{
    if(selectedSlot===undefined)
      return {selectedSlot};
    let game_player = state.game?.game_players[selectedSlot];
    let playerAction = game_player && getPlayerAction(game_player,state.selectedNode, state.selectedTurn);
    if(playerAction)
      return ({selectedSlot});
    return state; //default no changes
  }),
  setPlayhead: (playhead:number)=>set(state=>modifyPlayhead(state, playhead)),
  incrementPlayhead: (by=1000, limits, loop=false)=>set(state=>modifyPlayhead(state, state.playhead+(by), limits, loop)) //TODO add speed controller
}));

function modifyPlayhead(state:Store, playhead:number, limits?:[number|undefined, number|undefined], loop=false) {
  if(state.game){
    let newState:Partial<Store>&Pick<Store, 'playhead'> = {playhead: limits ? clamp(playhead, ...limits, loop) : clamp(playhead, state.game.game_found.log_time, undefined, loop)}
    let currentMission = getCurrentMissionNumber(state.game.missions,  newState.playhead);
    newState.selectedNode = currentMission;
    let numTurns = maxTurns(state.selectedNode, state.game.game_players, newState.playhead);
    newState.selectedTurn = numTurns; //latest turn
    let latestProposal = getLatestProposal(state.game.game_players, currentMission, newState.playhead);
    newState.selectedSlot = latestProposal?.playerSlot;
    return newState;
  }
  return {};
}