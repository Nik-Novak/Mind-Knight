//@ts-check
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, useHistory } from 'react-router-dom';
import { fetchVersion } from './redux/actions/version-actions';
import socket from './socket';
import './css/App.css';
import './css/App-colour.css';
import GlobalFeedback from './components/global-feedback/Feedback';
import Menu from './menu/Menu'
import Game from './game/Game'
import { updateStateServer } from './redux/actions/state-server-actions';
import { updateGame } from './redux/actions/game-actions';

import axios from 'axios'

const mapStoretoProps=(store)=>({
  version: store.version,
  identity: store.identity
});

function App({version, identity, dispatch}) {

  const history = useHistory();

  function synchronize(){
    axios.get('/state', {baseURL:window.location.origin}).then(response=>dispatch(updateStateServer(response.data)));
    axios.get('/game', {baseURL:window.location.origin}).then(response=>dispatch(updateGame(response.data)));
  }

  useEffect(()=>{
    socket.on('log', (message)=> console.log('[SERVER LOG]',message) );

    // axios.get('/data/game?_id=5eb9efd53d601749f8e558ea', {baseURL:window.location.origin}).then(testGame=>dispatch(updateGame(testGame.data)));

    socket.on('connect', ()=>{
      console.log('RECONNECTED');
      synchronize();
    })

    socket.on('test',(data)=>console.log('TEST RECEIVED:', data));
    
    synchronize();

    socket.on('game_launch', ({state, game})=> { dispatch(updateStateServer(state)) });
    socket.on('game_menu', ({state, game})=> { dispatch(updateStateServer(state)); history.push('/'); });
    socket.on('game_close', ({state, game})=> { dispatch(updateStateServer(state)); });
    socket.on('game_start', ({state, game})=> { dispatch(updateStateServer(state)) && dispatch(updateGame(game)); history.push('/game'); console.log('GAME_UPDATE:', game); });
    socket.on('game_selectPhaseEnd', ({state, game})=> { dispatch(updateStateServer(state)) && dispatch(updateGame(game)); console.log('GAME_UPDATE:', game); });
    socket.on('game_votePhaseEnd', ({state, game})=> { dispatch(updateStateServer(state)) && dispatch(updateGame(game)); console.log('GAME_UPDATE:', game); });
    socket.on('game_missionPhaseEnd', ({state, game})=> { dispatch(updateStateServer(state)) && dispatch(updateGame(game)); console.log('GAME_UPDATE:', game); });
    socket.on('game_chatUpdate', ({state, game})=> {dispatch(updateStateServer(state)) && dispatch(updateGame(game)); console.log('GAME_UPDATE:', game); });
    socket.on('game_end', ({state, game})=> {dispatch(updateStateServer(state)) && dispatch(updateGame(game)); console.log('GAME_UPDATE:', game); });
    return ()=> socket.disconnect(); //on component unmount
  }, []);

  useEffect(()=>{
    dispatch(fetchVersion());
  }, []);

  return (
    <div id="container" className="App">
      <GlobalFeedback version={version} identity={identity} />
      <Switch>
        <Route path="/game" component={Game}/>
        <Route path="/" component={Menu}/>
      </Switch>
    </div>
  );
}

export default connect(mapStoretoProps)(App);
