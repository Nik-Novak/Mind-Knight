//@ts-check
import { noChange } from './_shared/functions';
import { maxTurns } from 'shared-functions';

import { composite, safeAccess } from 'pathify'
import { setSelectionTurn } from '../actions/state-app-game-actions';
const defaults = {
  debug_panel: {
    show:false,
    content:[]
  },
  settings_panel: {
    show:true,
  },
  chat_panel: {
    show:true,
  },
  selection: {
    node: null,
    turn: 1,
    slot: null,
    hoveredNode: null,
    hoveredSlot: null
  }
}

export default function reducer(state={
  ...defaults,

}, action){
  switch (action.type){
    case 'SET_DEBUG_PANEL_SHOW':
      return composite({ ...state, 'debug_panel.show':action.payload });
    case 'SET_DEBUG_PANEL_CONTENT':
      return composite({ ...state, 'debug_panel.content':action.payload });
    case 'SET_SETTINGS_PANEL_SHOW':
      return composite({ ...state, 'settings_panel.show':action.payload });
    case 'SET_CHAT_PANEL_SHOW':
      return composite({ ...state, 'chat_panel.show':action.payload });
    case 'SET_CHAT_PANEL_CONTENT':
      return composite({ ...state, 'chat_panel.content':action.payload });
    case 'SET_SELECTION_NODE':{
      let newNodeSelection = action.payload;
      let prevNodeSelection = action.store.state.app.game.selection.node;
      let game = action.store.game;
      if(noChange(newNodeSelection, prevNodeSelection))
        return state;
      if(newNodeSelection===null) //unset node selection => defaults
        return composite({...state, selection:defaults.selection});
      //check if game-ending node
      let nodeAfterGameEnd = false;
      if(safeAccess(game, 'game_end')!==undefined){
        let numberOfMissions=0;
        let missions = safeAccess(game, 'missions');
        if(missions)
          numberOfMissions = Object.keys(missions).length;
        if(newNodeSelection>=numberOfMissions)
          nodeAfterGameEnd=true;
      }
      if( newNodeSelection==1 || safeAccess(game, `missions.${newNodeSelection}.mission_phase_end`) || safeAccess(game, `missions.${newNodeSelection-1}.mission_phase_end`)&&!nodeAfterGameEnd ){ //if ( node==1 || current node has a mission_end an is complete || previous node has a mission_end and this node is not the game-ending node )
        let newMaxTurns = maxTurns(newNodeSelection, action.store.game.players);
        if(action.store.state.app.game.selection.turn > newMaxTurns)
          action.asyncDispatch(setSelectionTurn(newMaxTurns));
        return composite({...state, 'selection.node':action.payload}); //allow new changes
      }
      //default
      console.log('DEFAULT_NO_CHANGE');
      return state; //otherwise by default dont modify
    }
    case 'SET_SELECTION_TURN':{
      let newTurnSelection = action.payload;
      let prevTurnSelection = action.store.state.app.game.selection.turn;
      let currSelection = action.store.state.app.game.selection;
      let game = action.store.game;
      if(noChange(newTurnSelection, prevTurnSelection))
        return state;
      let maxNumTurns=maxTurns(currSelection.node, game.players);
      if( 1 <= newTurnSelection && newTurnSelection <= maxNumTurns ) //if selection is valid
        return composite({...state, 'selection.turn':action.payload});
      console.log('DEFAULT_NO_CHANGE');
      return state;
    }
    case 'SET_SELECTION_SLOT':{
      let newSlotSelection = action.payload;
      let currSelection = action.store.state.app.game.selection;
      let game = action.store.game;

      let turnInfo = safeAccess(game, `players.${newSlotSelection}.proposals.${currSelection.node}.${currSelection.turn-1}`);
      if(turnInfo && turnInfo.Proposer!=undefined) //never propped or in teh middle of propping
        return composite({...state, 'selection.slot':action.payload});
      console.log('DEFAULT_NO_CHANGE');
      return state;
    }
    case 'SET_SELECTION_HOVERED_NODE':{
      let newHoveredNode = action.payload;
      let currSelection = action.store.state.app.game.selection;
      if(noChange(newHoveredNode, currSelection.hoveredNode))
        return state
      if(newHoveredNode==null || 1<=newHoveredNode && newHoveredNode<=5)
        return composite({...state, 'selection.hoveredNode':newHoveredNode});
      console.log('DEFAULT_NO_CHANGE');
      return state;
    }
    case 'SET_SELECTION_HOVERED_SLOT':{
      let newHoveredSlot = action.payload;
      let currSelection = action.store.state.app.game.selection;
      let numPlayers = safeAccess(action.store.game, 'game_found.PlayerNumber');
      if(noChange(newHoveredSlot, currSelection.hoveredSlot))
        return state
      if(newHoveredSlot==null || 0<=newHoveredSlot && newHoveredSlot<=numPlayers-1)
        return composite({...state, 'selection.hoveredSlot':newHoveredSlot});
      console.log('DEFAULT_NO_CHANGE');
      return state;
    }
    default:
      // console.error(`Action type: ${action.type} is not supported.\nAction: ${action}`);// throw Error(`Action type: ${action.type} is not supported.\nAction: ${action}`);
      return state;
  }
}


/*
      if(!newSelection.)
      if(nodeNum===undefined || playerIndex===undefined || turnNum===undefined || !game.players[playerIndex].proposals || !game.players[playerIndex].proposals[nodeNum] ||!game.players[playerIndex].proposals[nodeNum][turnNum-1] )
        return;
      // console.log(playerIndex, nodeNum, turnNum-1);
      let turnInfo = game.players[playerIndex].proposals[nodeNum][turnNum-1];
      if(!turnInfo || turnInfo.Proposer===undefined) //never propped or in teh middle of propping
          return;

*/