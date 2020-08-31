//@ts-check
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setChatPanelShow, setDebugPanelShow } from '../../../redux/actions/state-app-game-actions'
import './Panel.css';


function Panel({id=undefined, title, show, content=[], onToggle, children=null}){
  const [logs, setLogs] = useState([]);

  useEffect(()=>{
    setLogs(content.map(item=><li>[LOG] {item}</li>));
  }, content);

  return (
    <div id={id} className="panel">
      <div className="panel-title" onClick={onToggle}><p>{title}</p></div>
      {
        children ? React.cloneElement(children, { style:{display: `${show?'block':'none'}`} })
        : <ul style={{display: `${show?'block':'none'}`}}>
          {logs}
        </ul>
      }
    </div>
  );
}

export default Panel;