//@ts-check
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectionTurn } from '../../../redux/actions/state-app-game-actions';
import './TurnContainer.css';
import TurnSelector from './TurnSelector';
import { maxTurns } from 'shared-functions';

function TurnContainer({selectedNode, selectedTurn, players}){
  const dispatch = useDispatch();
  const [turnSelectors, setTurnSelectors] = useState([]);
  
  useEffect(()=>{
    let maxNumTurns=maxTurns(selectedNode, players);
    let newTurnSelectors = [];
    newTurnSelectors.push(<TurnSelector key={1} index={1} selected={selectedTurn==1} onClick={(event)=>dispatch(setSelectionTurn(1))}/>)
    for(let i=1; i<maxNumTurns; i++)
      newTurnSelectors.push(<TurnSelector key={i+1} index={i+1} selected={selectedTurn==i+1} onClick={(event)=>dispatch(setSelectionTurn(i+1))}/>)
    setTurnSelectors(newTurnSelectors);
  }, [selectedNode, selectedTurn, players]);

  return (
    <div className="turn-container">
      {turnSelectors}
    </div>
  );
}

export default TurnContainer;