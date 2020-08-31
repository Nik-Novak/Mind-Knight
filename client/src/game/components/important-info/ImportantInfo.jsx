//@ts-check
import React, { useState, useEffect } from 'react';
import './ImportantInfo.css';
import { safeAccess } from 'pathify';
import { colors, getPropIndex, getHammerPlayerIndex } from 'shared-functions';

export function coloredTextSpan(text, color, options={key:undefined}){
  return <span key={options.key} style={{color:color}}>{text}</span>;
}

function trueMod(n, m) {
  return ((n % m) + m) % m;
}

function numSuffix(num){
  let numMod100 = num%100;
  switch(num%10){
      case 1:
        return num + (numMod100===11 ? 'th' : 'st');
      case 2:
        return num + (numMod100===12 ? 'th' : 'nd');
      case 3:
        return num + (numMod100===13 ? 'th' : 'rd');
      default: return num + 'th'
  }
}

function ImportantInfo({selectedNode, selectedTurn, selectedSlot, players, numPlayers}){
  const [proposer, setProposer] = useState(undefined);
  const [nth, setNth] = useState(undefined);
  const [action, setAction] = useState(undefined);
  const [targets, setTargets] = useState(undefined);

  useEffect(()=>{
    let turnInfo = safeAccess(players, `${selectedSlot}.proposals.${selectedNode}.${selectedTurn-1}`);
    let proposerSlot = turnInfo && turnInfo.Proposer;
    let name = safeAccess(players, `${proposerSlot}.Username`);
    let nameColour = safeAccess(players, `${proposerSlot}.Color`);
    setProposer(turnInfo&&coloredTextSpan(name, colors[nameColour].hex));
    setNth(turnInfo&&numSuffix(selectedTurn));
    setAction(turnInfo&&turnInfo.Passed?'passed hammer' : 'proposed');
    let newTargets = [];
    if(turnInfo)
      if(turnInfo.Passed){
        let propIndex = getPropIndex(turnInfo); //IMPORTANT CONVERSION FOR PROP TRANSITION
        let hammerPlayerIndex = getHammerPlayerIndex(propIndex, selectedSlot, numPlayers); //IMPORTANT: hammer is who they pass it to
        let fromPlayerIndex = trueMod(hammerPlayerIndex-1,numPlayers);
        let fromPlayer = coloredTextSpan(players[fromPlayerIndex].Username, colors[players[fromPlayerIndex].Color].hex, {key:1});
        let toPlayer = coloredTextSpan(players[hammerPlayerIndex].Username, colors[players[hammerPlayerIndex].Color].hex, {key:3});
        newTargets.push('from ');
        newTargets.push(fromPlayer);
        newTargets.push(' to ');
        newTargets.push(toPlayer);
      }
      else{
        let proposedPlayerSlots = turnInfo.SelectedTeam;
        proposedPlayerSlots.forEach((playerSlot, index)=>{
          newTargets.push( coloredTextSpan(players[playerSlot].Username+' ', colors[players[playerSlot].Color].hex, {key:index}) );
        });
      }
      
    setTargets(newTargets);

  }, [selectedNode, selectedTurn, selectedSlot, players])

  return (
    <div className="important-info">
      <div className="left">
        <p className={`proposer ${proposer?'':'hidden'}`}><span className="proposer">{proposer}</span>'s</p>
        <p className={`proposer ${proposer?'':'hidden'}`}><span className="turn-number">{nth}</span> turn</p>
      </div>
      <div className="center">
        <p>node</p>
        <h3 className="node-number">{selectedNode}</h3>
      </div>
      <div className="right">
        <p className="action">{action}</p>
        {/* <!--<p className="action">passed hammer</p>--> */}
        <p className="targets">{targets}</p>
      </div>
    </div>
  );
}

export default ImportantInfo;