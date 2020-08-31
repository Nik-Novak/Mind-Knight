//@ts-check
import React, { useEffect, useState } from 'react';
import './AdvancedNodeStats.css';
import { safeAccess } from 'pathify';

import { colors } from 'shared-functions';

function coloredTextSpan(text, color, options={key:undefined}){
  return <span key={options.key} style={{color:color}}>{text}</span>;
}

function AdvancedNodeStats({show, hoveredNode, missions, players}){
  const [node, setNode] = useState(undefined);
  const [numParticipants, setNumParticipants] = useState();
  const [participants, setParticipants] = useState([]);
  const [proposer, setProposer] = useState(undefined);
  const [proposalIndex, setProposalIndex] = useState(undefined);
  const [acceptedBy, setAcceptedBy] = useState([]);
  const [refusedBy, setRefusedBy] = useState([]);
  const [result, setResult] = useState(undefined);
  const [numHackersDetected, setNumHackersDetected] = useState();
  const [missionLength, setMissionLength] = useState(undefined);

  useEffect(()=>{
    let mission = safeAccess(missions, `${hoveredNode}`);
    if(!mission || !mission.mission_phase_end)
      return;
    setNode(hoveredNode);
    let playerSlots = mission.mission_phase_start.Players;
    if(playerSlots){
      setNumParticipants(playerSlots.length);
      let newParticipants = [];
      playerSlots.forEach((playerSlot, index)=>{
        let username = safeAccess(players, `${playerSlot}.Username`);
        let color = colors[safeAccess(players, `${playerSlot}.Color`)].hex;
        newParticipants.push(coloredTextSpan(username+' ', color, {key:index}));
      });
      setParticipants(newParticipants);
    }
    let proposerSlot = mission.mission_phase_end.Proposer;
    let proposerUsername = safeAccess(players, `${proposerSlot}.Username`);
    let color = colors[safeAccess(players, `${proposerSlot}.Color`)].hex;
    setProposer(<span style={{color}}>{proposerUsername}</span>);
    setProposalIndex(mission.mission_phase_end.propNumber-1);
    let proposerProposals = safeAccess(players, `${proposerSlot}.proposals.${hoveredNode}`);
    let missionProposal = proposerProposals && proposerProposals[proposerProposals.length-1];
    let newAcceptedBy = [];
    missionProposal && missionProposal.vote_phase_end.VotesFor.forEach((playerSlot, index)=>{
      let username = safeAccess(players, `${playerSlot}.Username`);
      let color = colors[safeAccess(players, `${playerSlot}.Color`)].hex;
      newAcceptedBy.push(coloredTextSpan(username+' ', color, {key:index}));
    });
    setAcceptedBy(newAcceptedBy);
    let newRefusedBy = [];
    missionProposal && missionProposal.vote_phase_end.VotesAgainst.forEach((playerSlot, index)=>{
      let username = safeAccess(players, `${playerSlot}.Username`);
      let color = colors[safeAccess(players, `${playerSlot}.Color`)].hex;
      newRefusedBy.push(coloredTextSpan(username+' ', color, {key:index}));
    });
    setRefusedBy(newRefusedBy);
    setResult(mission.mission_phase_end.Failed===true?coloredTextSpan('HACKED', '#952C30'):coloredTextSpan('SECURED', '#159155'));
    setNumHackersDetected(mission.mission_phase_end.NumHacks);
    setMissionLength(mission.mission_phase_end.deltaT/1000);
  }, [hoveredNode]);
  return (
    <div className="advanced-node-container" style={{opacity:`${show?1:0}`}}>
      <table className="advanced-node-container">
        <tbody>
          <tr>
            <th colSpan={2}>Node #<span className="node-number">{node}</span></th>
          </tr>
          <tr>
            <td># of participants: </td><td className="node-participants-number">{numParticipants}</td>
          </tr>
          <tr>
            <td>Participants: </td><td className="node-participants">{participants}</td>
          </tr>
          <tr>
            <td>Proposed by: </td><td className="node-proposer">{proposer}</td>
          </tr>
          <tr>
            <td>Proposal #: </td><td><span className="prop-number">{proposalIndex}</span>/5</td>
          </tr>
          <tr>
            <td>Accepted by: </td><td className="node-refusers">{acceptedBy}</td>
          </tr>
          <tr>
            <td>Refused by: </td><td className="node-refusers">{refusedBy}</td>
          </tr>
          <tr>
            <td>Result: </td><td className="node-result">{result}</td>
          </tr>
          <tr>
            <td># of hackers detected: </td><td className="node-num-hackers">{numHackersDetected}</td>
          </tr>
          <tr>
            <td>Mission length (s): </td><td className="node-time">{missionLength}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AdvancedNodeStats;