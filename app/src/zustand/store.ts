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
  incrementPlayHead: (by?:number)=>void
}



export const useStore = create<Store>((set)=>({
  game: undefined,
  selectedNode: undefined,
  selectedTurn: 1,
  selectedSlot: undefined,
  playHead: undefined,
  setGame: (game:Game|undefined)=>set(state=>({game})),
  setSelectedNode: (newNode:NodeNumber|undefined)=>set(state=>{
    if(newNode === undefined || newNode === 1) 
      return ({selectedNode: newNode});
    let currentMission = getCurrentMissionNumber(state.game?.missions);
    if(state.game && newNode <= currentMission){ //node exists
      let prevNode = Math.max(newNode-1, 1) as NodeNumber;
      if( hasHappened(state.game.missions[prevNode]?.mission_phase_start.log_time, state.playHead) ){
        let newMaxTurns = maxTurns(newNode, state.game.game_players);
        let selectedTurn = Math.min(newMaxTurns, state.selectedTurn, 1); //ensuring turn exists
        return ({selectedNode: newNode, selectedTurn});
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
  incrementPlayHead: (by=1000)=>set(state=>modifyPlayhead(state, state.playHead && new Date(state.playHead.valueOf()+(by)))) //TODO add speed controller
}));

function modifyPlayhead(state:Store, playHead:Date|undefined) {
  {
    let newState:Partial<Store> = {playHead}
    if(state.game){
      let currentMission = getCurrentMissionNumber(state.game.missions, playHead);
      newState.selectedNode = currentMission;
      let numTurns = maxTurns(state.selectedNode, state.game.game_players, playHead);
      newState.selectedTurn = numTurns; //latest turn
      let latestProposal = getLatestProposal(state.game.game_players, currentMission, playHead);
      newState.selectedSlot = latestProposal?.playerSlot;
      // let action = state.selectedSlot && getPlayerAction(state.game.game_players[state.selectedSlot], state.selectedNode, state.selectedTurn, playHead);
      // if(!action)
      //   newState.selectedSlot = undefined;
        
    }
    return newState;
  }
}