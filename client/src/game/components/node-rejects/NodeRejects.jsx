//@ts-check
import React, { useEffect, useState } from 'react';
import './NodeRejects.css';
import { safeAccess } from 'pathify';

function NodeRejects({selectedNode, selectedTurn, selectedSlot, players}){
  const [numRejects, setNumRejects] = useState(0);

  useEffect(()=>{
    let turnInfo = safeAccess(players, `${selectedSlot}.proposals.${selectedNode}.${selectedTurn-1}`);
    if(turnInfo && turnInfo.propNumber!==undefined)
      setNumRejects(turnInfo.propNumber-1);
  }, [selectedNode, selectedSlot, selectedTurn]);

  return (
    <div className="noderejects-container">
      <p>Node Teams Rejected</p>
      <h4><span>{numRejects}</span>/5</h4>
    </div>
  );
}

export default NodeRejects;