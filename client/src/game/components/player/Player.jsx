import React from 'react';
import './Player.css';
import srcSkinDefault from './img/skin-default.png';
import { Tooltip } from '@material-ui/core';

function Player({index, name, selected=false, highlighted=false, hasAction=false, hasHammer=false, isDisconnected=false, vote=undefined, proppedIndex=undefined, passed=undefined, username=undefined, level=undefined, onClick, onMouseEnter, onMouseLeave}){
  let voteIcon;
  switch (vote){
    case 'accept': voteIcon='fa-check'; break;
    case 'refuse': voteIcon='fa-times'; break;
  }
  return (
    <div className={`player-container ${selected?'selected':''} ${highlighted?'highlighted':''}`} index={index}>  {/* selected and highlighted classes determine props etc */}
      <div className="player-img" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <img src={srcSkinDefault} alt="" onClick={onClick}/>
        <Tooltip title="This player has an action available to view" placement="left" arrow>
          <i className={`action-exists-icon fas fa-exclamation ${hasAction?'':'hidden'}`}></i>
        </Tooltip>
        <Tooltip title="This player had hammer at the time of the shown proposal" placement="left" arrow>
          <i className={`hammer-icon fas fa-hammer ${hasHammer?'':'hidden'}`}></i>
        </Tooltip>
        <Tooltip title="This player was disconnected at the time of the shown proposal" placement="right" arrow>
          <i className={`disconnect-icon fas fa-plug ${isDisconnected ? '': 'hidden'}`}></i>
        </Tooltip>
        <Tooltip title={`This player ${vote==='accept'?'accepted':'refused'} the shown proposal`} placement="right" arrow>
          <i className={`vote-icon fas ${voteIcon}`}></i>
        </Tooltip>
        <Tooltip title={`This player proposed when there ${proppedIndex===1?'was':'were'} ${proppedIndex} node team${proppedIndex===1?'':'s'} rejected`} placement="right" arrow>
          <p className={`prop-number-container ${proppedIndex===undefined?'hidden':''}`}><span className="prop-number">{proppedIndex}</span>/5</p>
        </Tooltip>
      </div>
      <div className="player-info">
        <div className="player-name">{name}</div>
        <div className="player-username">{username}</div>
        <div className="player-level">{level?`(${level})`:undefined}</div>
      </div>
    </div>
  );
}

export default Player;