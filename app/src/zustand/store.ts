import { NodeNumber, PlayerSlot } from "@/types/game"
import { getCurrentMissionNumber, getLatestProposal, getPlayerAction, hasHappened, maxTurns } from "@/utils/functions/game";
import { Game } from "@prisma/client";
import { create } from 'zustand'

type Store = {
  game: Game|undefined,
  selectedNode: NodeNumber|undefined,
  selectedTurn: number,
  selectedSlot: PlayerSlot|undefined,
  playHead: Date|undefined,
  setGame: (game:Game|undefined)=>void,
  setSelectedNode: (selectedNode:NodeNumber|undefined)=>void,
  setSelectedTurn: (selectedTurn:number)=>void,
  setSelectedSlot: (selectedSlot:PlayerSlot|undefined)=>void,
  setPlayHead: (playHead:Date|undefined)=>void,
  incrementPlayHead: (by?:number, limits?:[number, number], loop?:boolean)=>void
}



export const useStore = create<Store>((set)=>({
  game: undefined,
  selectedNode: undefined,
  selectedTurn: 1,
  selectedSlot: undefined,
  playHead: undefined,
  setGame: (game:Game|undefined)=>set(state=>({game})),
  setSelectedNode: (newNode:NodeNumber|undefined)=>set(state=>{
    if(newNode === undefined) 
      return ({selectedNode: newNode});
    let currentMission = getCurrentMissionNumber(state.game?.missions);
    if(state.game && newNode <= currentMission){ //node exists
      let prevNode = Math.max(newNode-1, 1) as NodeNumber;
      if( state.game.missions[prevNode]?.mission_phase_start ){
        let newMaxTurns = maxTurns(newNode, state.game.game_players);
        let selectedTurn = Math.min(newMaxTurns, state.selectedTurn, 1); //ensuring turn exists
        let newPlayhead = state.game.missions[newNode]?.mission_phase_end?.log_time || state.game.latest_log_time;
        return ({selectedNode: newNode, selectedTurn, playHead:newPlayhead});
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
  setPlayHead: (playHead:Date|undefined)=>set(state=>modifyPlayhead(state, playHead)),
  incrementPlayHead: (by=1000, limits, loop=false)=>set(state=>modifyPlayhead(state, state.playHead && new Date(state.playHead.valueOf()+(by)), limits, loop)) //TODO add speed controller
}));

function clamp(value:Date|undefined, min?:Date|number, max?:Date|number, loop=false){
  if(value === undefined) return undefined;
  if(min && value.valueOf() < min.valueOf())
    return typeof min === 'number' ? new Date(min) : min;
  else if(max && value.valueOf() > max.valueOf()){
    if(loop)
      return typeof min === 'number' ? new Date(min) : min;
    return typeof max === 'number' ? new Date(max) : max;
  }
  return value;
}

function modifyPlayhead(state:Store, playHead:Date|undefined, limits?:[number, number], loop=false) {
  if(state.game){
    let newState:Partial<Store> = {playHead: limits ? clamp(playHead, ...limits, loop) : clamp(playHead, state.game.game_found.log_time, undefined, loop)}
    // newState.playHead = clamp(newState.playHead, state.game.game_found.log_time, state.game.latest_log_time)
    let currentMission = getCurrentMissionNumber(state.game.missions,  newState.playHead);
    newState.selectedNode = currentMission;
    let numTurns = maxTurns(state.selectedNode, state.game.game_players, newState.playHead);
    newState.selectedTurn = numTurns; //latest turn
    let latestProposal = getLatestProposal(state.game.game_players, currentMission, newState.playHead);
    newState.selectedSlot = latestProposal?.playerSlot;
    return newState;
  }
  return {};
}