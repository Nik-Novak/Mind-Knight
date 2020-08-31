//@ts-check
import React, { useState, useEffect } from 'react';
import './Players.css'
import Player from '../player/Player';
import { safeAccess } from 'pathify';
import { getPropIndex, getHammerPlayerIndex } from 'shared-functions';
import { useDispatch } from 'react-redux';
import { setSelectionSlot, setSelectionHoveredSlot } from '../../../redux/actions/state-app-game-actions';
import { colors } from 'shared-functions'

//******IMPORTANT: Swappable CSS Files are found in teh public/swappable-css folder ********* */

function coloredTextSpan(text, color){
  return <span style={{color:color}}>{text}</span>;
}

function Players({selectedNode, selectedTurn, selectedSlot, players, numPlayers, playerIdentities, displayUsernames}){
  const dispatch = useDispatch();
  const [playerComponents, setPlayerComponents] = useState([]);
  const [stylePath, setStylePath] = useState('./swappable-css/5man.css');

  useEffect(() => {
    if(numPlayers!=undefined){
      console.log('HOT SWAPPING CSS');
      setStylePath(`./swappable-css/${numPlayers}man.css`);
    }
  }, [numPlayers]);

  useEffect(()=>{
    let turnInfo = safeAccess(players, `${selectedSlot}.proposals.${selectedNode}.${selectedTurn-1}`);
    let highlightedPlayerSlots = [];
    let propIndex = getPropIndex(turnInfo); //IMPORTANT CONVERSION FOR PROP TRANSITION
    let hammerPlayerIndex = getHammerPlayerIndex(propIndex, selectedSlot, numPlayers); //IMPORTANT: hammer is who they pass it to

    turnInfo&&turnInfo.SelectedTeam.forEach(playerSlot => highlightedPlayerSlots.push(playerSlot));

    let newPlayerComponents = [];
    for(let i=0; i<numPlayers; i++){
      let playerAction = safeAccess(players, `${i}.proposals.${selectedNode}.${selectedTurn-1}`);
      let name = safeAccess(players, `${i}.Username`);
      let nameColour = safeAccess(players, `${i}.Color`);
      let vote = turnInfo && turnInfo.vote_phase_end && (turnInfo.vote_phase_end.VotesFor.includes(i)?'accept':'refuse');
      let proppedIndex;
      if(playerAction && !playerAction.Passed)
        proppedIndex = playerAction.propNumber-1;
      let username, level;
      if(displayUsernames && playerIdentities){
        username = safeAccess(playerIdentities, `${i}.Nickname`);
        level = safeAccess(playerIdentities, `${i}.Level`);
      }
      newPlayerComponents.push(
        <Player 
          key={i} 
          index={i}
          name={coloredTextSpan(name, colors[nameColour].hex)} 
          selected={i==selectedSlot && playerAction!==undefined}
          highlighted={highlightedPlayerSlots.includes(i)} 
          hasAction={playerAction!==undefined} 
          hasHammer={i==hammerPlayerIndex} 
          isDisconnected={false} 
          vote={vote} 
          proppedIndex={proppedIndex}
          passed={ playerAction && playerAction.Passed }
          onClick={(e)=>dispatch(setSelectionSlot(i))}
          onMouseEnter={(e)=>dispatch(setSelectionHoveredSlot(i))}
          onMouseLeave={(e)=>dispatch(setSelectionHoveredSlot(null))}
          username={username}
          level={level}
        />
      );
    }
    setPlayerComponents(newPlayerComponents);
  }, [selectedNode, selectedTurn, selectedSlot, players, numPlayers, displayUsernames, playerIdentities]);

  return (
  <>
    <link rel="stylesheet" type="text/css" href={stylePath} /> 
    { playerComponents }
  </>
  );
}

export default Players;
