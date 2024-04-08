import { NodeNumber, PlayerSlot } from "@/types/game"
import { getCurrentMissionNumber, getPlayerAction, maxTurns } from "@/utils/functions/game";
import { Game } from "@prisma/client";
import { create } from 'zustand'

type Store = {
  game: Game|undefined,
  selectedNode: NodeNumber|undefined,
  selectedTurn: number,
  selectedSlot: PlayerSlot|undefined,
  setGame: (game:Game|undefined)=>void,
  setSelectedNode: (selectedNode:NodeNumber|undefined)=>void,
  setSelectedTurn: (selectedTurn:number)=>void,
  setSelectedSlot: (selectedSlot:PlayerSlot|undefined)=>void,
}

export const useStore = create<Store>((set)=>({
  game: undefined,
  selectedNode: undefined,
  selectedTurn: 1,
  selectedSlot: undefined,
  setGame: (game:Game|undefined)=>set(state=>({game})),
  setSelectedNode: (newNode:NodeNumber|undefined)=>set(state=>{
    console.log('game', state.game);
    if(newNode === undefined) 
      return ({selectedNode: newNode});
    let currentMission = getCurrentMissionNumber(state.game?.missions);
    if(state.game && newNode <= currentMission){ //node exists
      let newMaxTurns = maxTurns(newNode, state.game.game_players);
      let selectedTurn = Math.min(newMaxTurns, state.selectedTurn, 1); //ensuring turn exists
      return ({selectedNode: newNode, selectedTurn});
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
}));