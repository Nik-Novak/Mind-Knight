//@ts-check
import React, { useState, useEffect } from 'react';
import './Nodes.css';
import { useDispatch } from 'react-redux'
import { safeAccess } from 'pathify';
import NodeSelector from './NodeSelector';
import { setSelectionNode, setSelectionHoveredNode } from '../../../redux/actions/state-app-game-actions';

function Nodes({missions, missionInfo, selectedNode, onWheel }){
  const dispatch = useDispatch();
  const [nodeSelectors, setNodeSelectors] = useState([]);
  useEffect(()=>{
    console.log('NODE SELECTORS SHOULD UPDATE:');
    console.log(require('util').inspect(missions,false,99));
    let newNodeSelectors = missionInfo&&missionInfo.map((size, index)=>{
      let failed = safeAccess(missions, `${index+1}.mission_phase_end.Failed`); //missions['1']['mission_phase_end']['Failed']
      return <NodeSelector 
          key={index+1} 
          index={index+1} 
          size={size} 
          status={failed===undefined?'unknown':failed===true?'hacked':'secured'}
          selected={selectedNode==index+1}
          onClick={(event)=>dispatch(setSelectionNode(index+1))}
          onMouseEnter={(event)=>dispatch(setSelectionHoveredNode(index+1))}
          onMouseLeave={(event)=>dispatch(setSelectionHoveredNode(null))}
    />})
    setNodeSelectors(newNodeSelectors);
  }, [missions, missionInfo, selectedNode]);

  return (
    <div className="node-container" onWheel={onWheel}>
      {nodeSelectors}
    </div>
  );
}

export default Nodes;