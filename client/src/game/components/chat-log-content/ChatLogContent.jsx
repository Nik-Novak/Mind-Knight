//@ts-check
import React, { useEffect, useState } from 'react';
import './ChatLogContent.css';
import Highlighter from 'react-highlight-words';
import { colors } from 'shared-functions';
import Tooltip  from '@material-ui/core/Tooltip';

export function coloredTextSpan(text, color){
  return <span style={{color:color}}>{text}</span>;
}

function getTextContent(element){
  if (['string', 'number'].includes(typeof element)) return element
  if (element instanceof Array) return element.map(getTextContent).join('')
  if (typeof element === 'object' && element) return getTextContent(element.props.children)
}

function gameIsEnded(numHacks, numSecures){
  console.log(numHacks + ' -- ' + numSecures);
  if(numHacks>=3 || numSecures>=3)
    return true;
  return false;
}

function ChatLogContent({chat, players, missions, style=undefined, scrollToIndex=undefined}){
  const [chatList, setChatList] = useState([]);
  const [refList, setRefList] = useState([]);
  const [searchPattern, setSearchPattern] = useState('');
  const [showMatchingChatOnly, setShowMatchingChatOnly] = useState(false);

  useEffect(()=>{
    let newChatList = [];
    let newRefList = [];
    let missionEndChatIndexes = [];
    newChatList.push(<li key={`mission ${1}`} className="always-visible notification">{coloredTextSpan(`NODE 1 BEGINS`,'#D4AF37')}</li>)
    if(missions)
      Object.entries(missions).forEach(([key, value])=>{
        if(value.mission_phase_end)
          missionEndChatIndexes.push(value.mission_phase_end.chatIndex);
      });
    // let numHacks=0, numSecures=0; //WORKING GAME_END check, just useless since game ends as the final node finishes
    if(chat && players)
      chat.forEach((chatMsg,index)=>{
        let expectedChatIndex = index;
        missionEndChatIndexes.forEach((missionEndChatIndex, missionIndex)=>{
          if(expectedChatIndex<=missionEndChatIndex && missionEndChatIndex<=chatMsg.index){
            // if(missions[missionIndex+1].mission_phase_end.Failed)
            //   ++numHacks
            // else
            //   ++numSecures
            // if(!gameIsEnded(numHacks, numSecures))
              newChatList.push(<li key={`mission_${missionIndex+2}`} className="always-visible notification">{coloredTextSpan(`NODE ${missionIndex+2} BEGINS`,'#D4AF37')}</li>) //<li key={`mission ${missionIndex+1}`} className="always-visible notification">{coloredTextSpan(`NODE ${missionIndex+1} BEGINS`,'#D4AF37')}</li>
            // else
            //   newChatList.push(<li key={`game_end`} className="always-visible notification">{coloredTextSpan(`GAME END`,'#D4AF37')}</li>)
          }
        });
        let headerText = players[chatMsg.Slot].Username;
        let display=true;
        if(showMatchingChatOnly && !( headerText.toLowerCase().includes(searchPattern.toLowerCase()) || chatMsg.Message.toLowerCase().includes(searchPattern.toLowerCase()) ))
          display=false;
        let header = <span className="header" style={{color:colors[players[chatMsg.Slot].Color].hex}}><Highlighter highlightClassName='highlight' searchWords={[searchPattern]} textToHighlight={headerText} caseSensitive={false}/></span>;
        const ref = React.createRef();
        newChatList.push(<li key={chatMsg.index} ref={ref} index={chatMsg.index} className={`${display? '':'nodisp'}`}>[{header}]: <Highlighter highlightClassName='highlight' searchWords={[searchPattern]} textToHighlight={chatMsg.Message} caseSensitive={false}/></li> ); //<li key={chatMsg.index} index={chatMsg.index}>[<span className="header">{header}</span>]: {chatMsg.Message}</li>
        newRefList.push(ref);
      });
    setChatList(newChatList);
    setRefList(newRefList);
  }, [chat&&chat.length, searchPattern, showMatchingChatOnly]);

  useEffect(()=>{
    if(scrollToIndex===undefined)
      return;
    if(refList[scrollToIndex])
      refList[scrollToIndex].current.scrollIntoView({block:'end', inline:'nearest', behavior:'smooth'});
  }, [scrollToIndex] );
  
  return (
    <div style={style}>
      <div className="panel-search">
        <input className="search" type="search" placeholder="Search" onChange={(event)=>setSearchPattern(event.target.value)}/>
        <Tooltip title={showMatchingChatOnly?'SHOW all messages':'HIDE messages that do NOT match'} placement="right" arrow>
          <button className="toggle-visibility" onClick={(event)=>setShowMatchingChatOnly(!showMatchingChatOnly)}>
          <i className={`fas ${showMatchingChatOnly?'fa-eye':'fa-eye-slash'} fa-lg`}></i>
        </button>
        </Tooltip>
      </div>
      <ul>
        {chatList}
      </ul>
    </div>
  );
}

export default ChatLogContent;