//@ts-check
import axios from 'axios'
import { maxTurns } from 'shared-functions';

export function setDebugPanelShow(value){
  return {
    type: "SET_DEBUG_PANEL_SHOW",
    payload: value
  }
}
export function setSettingsPanelShow(value){
  return {
    type: "SET_SETTINGS_PANEL_SHOW",
    payload: value
  }
}
export function setChatPanelShow(value){
  return {
    type: "SET_CHAT_PANEL_SHOW",
    payload: value
  }
}

export function setSelectionNode(value){
  return (dispatch, getState)=>{ //thunky goodness
    dispatch(
      {
        type: "SET_SELECTION_NODE",
        payload: value,
        store: getState()
      }
    );
  }
}

export function setSelectionTurn(value){
  return (dispatch, getState)=>{
    dispatch(
      {
        type: "SET_SELECTION_TURN",
        payload: value,
        store: getState()
      }
    );
  }
}

export function setSelectionSlot(value){
  return (dispatch, getState)=>{
    dispatch(
      {
        type: "SET_SELECTION_SLOT",
        payload: value,
        store: getState()
      }
    );
  }
}

export function setSelectionHoveredNode(value){
  return (dispatch, getState)=>{
    dispatch(
      {
        type: "SET_SELECTION_HOVERED_NODE",
        payload: value,
        store: getState()
      }
    );
  }
}

export function setSelectionHoveredSlot(value){
  return (dispatch, getState)=>{
    dispatch(
      {
        type: "SET_SELECTION_HOVERED_SLOT",
        payload: value,
        store: getState()
      }
    );
  }
}