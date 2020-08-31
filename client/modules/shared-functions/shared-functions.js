//@ts-check
export function maxTurns(selectedNode, players){
  let maxTurns = 1;
  players && Object.keys(players).forEach( key=>{
    if(players[key].proposals && players[key].proposals[selectedNode] && players[key].proposals[selectedNode].length > maxTurns)
      maxTurns=parseInt(players[key].proposals[selectedNode].length);
  });
  return maxTurns;
}

export function getPropIndex(turnInfo){
  return turnInfo && ( turnInfo.Passed ? turnInfo.propNumber-2 : turnInfo.propNumber-1 ); //IMPORTANT CONVERSION FOR PROP TRANSITION
}

export function getHammerPlayerIndex(propIndex, selectedSlot, numPlayers){
  return ( (4-propIndex) + parseInt(selectedSlot) ) % parseInt(numPlayers)
}

export const colors = {
  '0':{ name:'light-blue', hex:'#00A6F6' },
  '1':{ name:'magenta', hex:'#D31FD4' },
  '2':{ name:'light-green', hex:'#6FE015' },
  '3':{ name:'grey', hex:'#9D9D9D' },
  '4':{ name:'orange', hex:'#FF8113' },
  '5':{ name:'yellow', hex:'#FFEC16' },
  '6':{ name:'turquoise', hex:'#00B48B' },
  '7':{ name:'dark-blue', hex:'#0041F6' }
}

// export function coloredTextSpan(text, color, options={key:undefined}){
//   return <span key={options.key} style={{color:color}}>{text}</span>;
// }

// export function getColouredUsername(playerSlot, players, {key=undefined, prefix='', suffix=''}={}){
//   let username = players && players[playerSlot] && players[playerSlot].Username;
//   let colour = colors[players[playerSlot].Color].hex;
//   return coloredTextSpan(prefix+username+suffix, colour, {key});
// }