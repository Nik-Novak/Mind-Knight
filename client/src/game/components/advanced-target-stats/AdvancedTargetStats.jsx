//@ts-check
import React, { useEffect, useState } from 'react';
import './AdvancedTargetStats.css';
import { safeAccess } from 'pathify';
import { colors } from 'shared-functions';

function coloredTextSpan(text, color){
  return <span style={{color:color}}>{text}</span>;
}

function AdvancedTargetStats({show, selectedNode, selectedTurn, selectedSlot, hoveredSlot, players}){
  const [name, setName] = useState(undefined);
  const [actionText, setActionText] = useState(undefined);
  const [timeSpent, setTimeSpent] = useState(undefined);
  const [autoProp, setAutoProp] = useState(undefined);
  const [vote, setVote] = useState(undefined);
  const [timeSpentVoting, setTimeSpentVoting] = useState(undefined);
  const [autoVote, setAutoVote] = useState(undefined);
  const [timeForAllVotes, setTimeForAllVotes] = useState(undefined);
  
  useEffect(()=>{
    let turnInfo = safeAccess(players, `${selectedSlot}.proposals.${selectedNode}.${selectedTurn-1}`);
    if(!turnInfo || hoveredSlot==null || !show)
      return;
    let username=safeAccess(players,`${hoveredSlot}.Username`);
    let color=colors[safeAccess(players,`${hoveredSlot}.Color`)].hex;
    setName(coloredTextSpan(safeAccess(players,`${hoveredSlot}.Username`),color));
    if(turnInfo.Passed===false){ //info if proposing
      setActionText('proposing');
      if(selectedSlot === hoveredSlot){
        setTimeSpent(turnInfo.deltaT/1000);
        setAutoProp(turnInfo.deltaT<1000 || turnInfo.deltaT>=60000 ? 'true' : 'false');
      }
      else{
        setTimeSpent(null);
        setAutoProp(null);
      }
      let vote = turnInfo.vote_phase_end && (turnInfo.vote_phase_end.VotesFor.includes(hoveredSlot)?'ACCEPT':'REFUSE');
      setVote(vote);
      let voteDeltaT = safeAccess(turnInfo, `vote_made.${hoveredSlot}.deltaT`);
      if(voteDeltaT!==undefined){
        setTimeSpentVoting(voteDeltaT/1000);
        setAutoVote(voteDeltaT<=0 || voteDeltaT>=60000 ? 'true' : 'false');
        let maxVoteT = voteDeltaT;
        Object.entries(turnInfo.vote_made).forEach(([playerSlot, vote])=>{
          if(vote.deltaT>maxVoteT)
            maxVoteT=vote.deltaT;
        });
        setTimeForAllVotes(maxVoteT/1000);
      }
    }
    else if(turnInfo.Passed===true && hoveredSlot===selectedSlot){ //info if passing and hovering over the person passing
      setActionText('before passing');
      setTimeSpent(turnInfo.deltaT/1000);
      setAutoProp(null);
      setVote(null);
      setTimeSpentVoting(null);
      setAutoVote(null);
      setTimeForAllVotes(null);
    }
  }, [show, selectedNode, selectedTurn, selectedSlot, hoveredSlot, players]);
  
  return (
    <table className="advanced-target-container" style={{opacity:`${show?'1':'0'}`}}>
      <tbody>
        <tr>
          <th className="advanced-target" colSpan={2}>{name}</th>
        </tr>
        <tr className={timeSpent==undefined?'nodisp':''}>
          <td>Time spent <span className="prop-type">{actionText}</span>(s): </td><td className="prop-time">{timeSpent}</td>
        </tr>
        <tr className={autoProp==undefined?'nodisp':''}>
          <td>Auto proposal: </td><td className="prop-auto">{autoProp}</td>
        </tr>
        <tr className={vote==undefined?'nodisp':''}>
          <td>Vote: </td><td className="vote-decision">{vote}</td>
        </tr>
        <tr className={timeSpentVoting==undefined?'nodisp':''}>
          <td>Time spent voting(s): </td><td className="vote-time">{timeSpentVoting}</td>
        </tr>
        <tr className={autoVote==undefined?'nodisp':''}>
          <td>Auto vote: </td><td className="vote-auto">{autoVote}</td>
        </tr>
        <tr className={timeForAllVotes==undefined?'nodisp':''}>
          <td>Time for all votes(s): </td><td className="vote-time-all">{timeForAllVotes}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default AdvancedTargetStats;