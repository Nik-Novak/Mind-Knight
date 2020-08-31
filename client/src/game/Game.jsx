//@ts-check
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setDebugPanelShow, setChatPanelShow, setSelectionTurn, setSelectionNode, setSelectionSlot, setSettingsPanelShow } from '../redux/actions/state-app-game-actions';
import { safeAccess } from 'pathify';
import './Game.scss';
import './Game-colour.scss';
import AdvancedOptions from './components/advanced-options/AdvancedOptions';
import Panel from './components/panel/Panel';
import ChatLogContent from './components/chat-log-content/ChatLogContent';
import Nodes from './components/nodes/Nodes';
import NodeRejects from './components/node-rejects/NodeRejects';
import AdvancedNodeStats from './components/advanced-node-stats/AdvancedNodeStats';
import ImportantInfo from './components/important-info/ImportantInfo';
import TurnContainer from './components/turn-container/TurnContainer';
import Players from './components/players/Players';
import Player from './components/player/Player';
import AdvancedTargetStats from './components/advanced-target-stats/AdvancedTargetStats';
import AdditionalMenu from './components/additional-menu/AdditionalMenu';


const mapStoreToProps = (store)=>{
  console.log('mapStoreToProps');
  return ({
  debug_panel_show:store.state.app.game.debug_panel.show,
  debug_panel_content:store.state.app.game.debug_panel.content,
  settings_panel_show:store.state.app.game.settings_panel.show,
  chat_panel_show:store.state.app.game.chat_panel.show,
  selection:store.state.app.game.selection,
  settings: store.settings,
  playerIdentities: safeAccess(store.game, 'game_end.PlayerIdentities'),
  chat: safeAccess(store.game, 'chat', []),
  players: safeAccess(store.game, 'players'),
  numPlayers: safeAccess(store.game, 'game_found.PlayerNumber'),
  missions: safeAccess(store.game, 'missions'),
  mission_info: safeAccess(store.game, 'game_found.MissionInfo'),
})}

function Game({debug_panel_show, debug_panel_content, settings_panel_show, chat_panel_show, chat, players, playerIdentities, numPlayers, missions, mission_info, selection, settings, dispatch}) {

  const [turnInfo, setTurnInfo] = useState(undefined);
  const [scrollToIndex, setScrollToIndex] = useState(undefined);

  useEffect(()=>console.log('debug_panel_show has updated'), [debug_panel_show]);
  useEffect(()=>console.log('debug_panel_content has updated'), [debug_panel_content]);
  useEffect(()=>console.log('settings_panel_show has updated'), [settings_panel_show]);
  useEffect(()=>console.log('chat_panel_show has updated'), [chat_panel_show]);
  useEffect(()=>console.log('chat has updated'), [chat]);
  useEffect(()=>console.log('players has updated'), [players]);
  useEffect(()=>console.log('playerIdentities has updated'), [playerIdentities]);
  useEffect(()=>console.log('numPlayers has updated'), [numPlayers]);
  useEffect(()=>console.log('missions has updated'), [missions]);
  useEffect(()=>console.log('mission_info has updated'), [mission_info]);
  useEffect(()=>console.log('selection has updated'), [selection]);
  useEffect(()=>console.log('settings has updated'), [settings]);
  useEffect(()=>console.log('dispatch has updated'), [dispatch]);

  useEffect(()=>{
    let turnInfo = safeAccess(players, `${selection.slot}.proposals.${selection.node}.${selection.turn-1}`);
    setTurnInfo(turnInfo);
    let scrollToIndex = turnInfo && turnInfo.chatIndex
    setScrollToIndex(scrollToIndex);
  }, [selection.node, selection.turn, selection.slot, players] );

  function scrollThroughProps(e){
    let thisTurnTimestamp = safeAccess(players, `${selection.slot}.proposals.${selection.node}.${selection.turn-1}.timestamp`);
    let nextSlot = e.deltaY<0?selection.slot-1:selection.slot+1;
    if(nextSlot>=numPlayers)
      nextSlot=0;
    else if (nextSlot<0)
      nextSlot=numPlayers-1;
    let nextTurnTimestamp = safeAccess(players, `${nextSlot}.proposals.${selection.node}.${selection.turn-1}.timestamp`);
    if(e.deltaY>0){ //progressing through node
      if(nextTurnTimestamp>=thisTurnTimestamp) //next turn is progress
        dispatch(setSelectionSlot(nextSlot))
      else if(settings.game.turn_scroll_lock===false){ //we have to switch turns to make progress
        let nextTurn = selection.turn+1;
        let nextTurnTimestamp = safeAccess(players, `${nextSlot}.proposals.${selection.node}.${nextTurn-1}.timestamp`);
        if(nextTurnTimestamp!==undefined){
          dispatch(setSelectionTurn(nextTurn))
          dispatch(setSelectionSlot(nextSlot))
        }
      }
    }
    else { //regressing through node
      if(nextTurnTimestamp<=thisTurnTimestamp)
        dispatch(setSelectionSlot(nextSlot))
      else if(settings.game.turn_scroll_lock===false){
        let nextTurn = selection.turn-1;
        let nextTurnTimestamp = safeAccess(players, `${nextSlot}.proposals.${selection.node}.${nextTurn-1}.timestamp`);
        if(nextTurnTimestamp!==undefined){
          dispatch(setSelectionTurn(nextTurn))
          dispatch(setSelectionSlot(nextSlot))
        }
      }
    }
    // dispatch(setSelectionTurn(e.deltaY<0?selection.turn-1:selection.turn+1))
  }
  return (
    <div id="container" className="App Game">
      <section id="content">
        <div className="content-left">
          <Panel id="debug-panel" title="Debug Log" show={debug_panel_show} content={debug_panel_content} onToggle={(event)=>dispatch(setDebugPanelShow(!debug_panel_show))}/>
          <Panel id="settings-panel" title="Settings" show={settings_panel_show} onToggle={(event)=>dispatch(setSettingsPanelShow(!settings_panel_show))}><AdvancedOptions settings={settings}/></Panel>
          <Panel id="chat-panel" title="Chat Log" show={chat_panel_show} onToggle={(event)=>dispatch(setChatPanelShow(!chat_panel_show))}><ChatLogContent chat={chat} players={players} missions={missions} scrollToIndex={settings.game.scroll_to_chat ? scrollToIndex : undefined}/></Panel>
        </div>

        <div className="content-center">
          <ImportantInfo selectedNode={selection.node} selectedTurn={selection.turn} selectedSlot={selection.slot} players={players} numPlayers={numPlayers}/>
          <div className="turns" onWheel={(e)=>dispatch(setSelectionTurn(e.deltaY<0?selection.turn-1:selection.turn+1))}>
          <TurnContainer selectedNode={selection.node} selectedTurn={selection.turn} players={players}/>
            <p>turn</p>
          </div>
          <div id="center-interface" onWheel={scrollThroughProps}>
            <Players selectedNode={selection.node} selectedSlot={selection.slot} selectedTurn={selection.turn} players={players} numPlayers={numPlayers} playerIdentities={playerIdentities} displayUsernames={settings.game.display_usernames}/>
            <AdvancedTargetStats 
              show={ settings.game.advanced_stats && ( selection.hoveredSlot!=undefined && turnInfo!==undefined && turnInfo.Passed===false || turnInfo!==undefined && turnInfo.Passed===true && selection.hoveredSlot===selection.slot ) }
              selectedNode={selection.node}
              selectedTurn={selection.turn}
              selectedSlot={selection.slot}
              hoveredSlot={selection.hoveredSlot}
              players={players}
            />
          </div>
          <AdditionalMenu/>
        </div>

        <div className="content-right">
          <Nodes missions={missions} missionInfo={mission_info} selectedNode={selection.node} onWheel={(e)=>dispatch(setSelectionNode(e.deltaY<0?selection.node-1:selection.node+1))} />
          <NodeRejects selectedNode={selection.node} selectedTurn={selection.turn} selectedSlot={selection.slot} players={players}/>
          <AdvancedNodeStats show={settings.game.advanced_stats && missions && selection.hoveredNode && missions[selection.hoveredNode]!=undefined} hoveredNode={selection.hoveredNode} missions={missions} players={players}/>
        </div>
      </section>
    </div>
  );
}

export default connect(mapStoreToProps)(Game);;


