//@ts-check
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';

import { connect } from 'react-redux'
import { fetchIdentity } from '../../../redux/actions/identity-actions'
import { fetchVersion } from '../../../redux/actions/version-actions'

import Title from '../../components/title/Title';
import Instructions from '../../components/instructions/Instructions';
import Button from '../../../components/button/Button';
import Version from '../../components/version/Version';
import './PageMain.scss';
import { Link, useHistory } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';

const mapStoreToProps = (store)=>({
  version: store.version,
  serverState: store.state.server
});

function PageMain({version, serverState, dispatch}){

  const history = useHistory();

  const [instructions, setInstructions] = useState('launch mindnight to begin...');
  const [countdown, setCountdown] = useState(0);
  
  useEffect(()=>{
    console.log('test')
    switch(serverState.lastEvent){
      case 'game_launch':
        setInstructions('game launched, awaiting main menu')
        break;
      case 'game_menu':
        setInstructions('ready for a game')
        break;
      case 'game_close':
        setInstructions('launch mindnight to begin...')
        break;
      default: setInstructions('launch mindnight to begin...')
    }
    let timer;
    if(serverState.gameInProgress){
      setInstructions(`A game is already in progress, loading in <span id="countdown">${countdown}</span>...`);
        setCountdown(3);
        timer = setInterval(()=>{
          if(countdown<=0) {
            clearInterval(timer);
            history.push('/game');
            return;
          }
          setCountdown(countdown-1);
        }, 1000);
    }
    return ()=> timer && clearInterval(timer); //cancel timer if we unmount this component
  }, [serverState.lastEvent]); //depends on state.lastEvent, rerun when this changes

  return ( 
    <section id="content" className="PageMain">
      <Title>
        <h1>Mind Knight</h1>
        <h2>A companion tool for <a href="http://www.mindnightgame.com/">Mindnight</a></h2>
        <h3 id="version"><Version local={version.local} remote={version.remote} checkingContent="checking version..." upToDateContent={<span>v{version.local} - (<Link to="/reinstall">reinstall</Link>)</span>} outOfDateContent={<span>v{version.local} - (<Link to="/update" style={{color:"red"}}>UPDATE</Link>)</span>}/></h3>
      </Title>
      <Instructions>
        <h3 className='instructions'>{instructions}</h3>
        <h3>OR</h3>
        <div className="options-container">
          <Tooltip title="Coming soon!" ><Button disabled id='option-tournaments' nav="/tournaments">Tournaments</Button></Tooltip> <Button disabled id='option-replays' nav="/replays">Replays</Button>
        </div>
      </Instructions>
    </section>
  );
}

export default connect(mapStoreToProps)(PageMain);