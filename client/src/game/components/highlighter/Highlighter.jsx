//@ts-check
import React from 'react';




// function createHighlights(elements, pattern, nodeName, className){
//   let newElements = [];
//   elements.forEach(element=>createHighlight(element, pattern).forEach(newElement=>newElements.push(newElement)));
//   return newElements;
// }

function createHighlight(element, pattern, nodeName='span', className='highlight', numMatches=0){
  if(!pattern) return [element];
  if(!element) return [];
  if(typeof element === 'string'){
    let match = element.match(pattern);
    if(match){
      // console.log('ELEM', element)
      // console.log('MATCH', match)
      let matchLen = match[0].length
      let highlight = React.createElement(nodeName, {className, key:numMatches}, element.substr(match.index, matchLen))
      // console.log([ element.substring(0, match.index), highlight, createHighlight(element.substring(match.index + matchLen), pattern) ])
      return [ element.substring(0, match.index), highlight, ...createHighlight(element.substring(match.index + matchLen), pattern, nodeName, className, ++numMatches) ]
    }
    else
      return [element];
  }
  else if(Array.isArray(element)){
    let elements = [];
    element.forEach(arrElement=>createHighlight(arrElement, pattern, nodeName, className)
                                  .forEach(newElement=>elements.push(newElement)));
    return elements;
  }
  else if (typeof element === 'object' && element) 
    return [...createHighlight(element.props.children)]
  else
    return [element]
}

function Highlighter({ pattern, nodeName='span', className='highlight', children,}){
  // if(test==12){
  //   let textContent = children.reduce((accum, child)=>accum + getTextContent(child));
  //   // console.log('TYPE', typeof children)
  //   // console.log('iSVALID', React.isValidElement(children))
  //   // console.log('TexTcONTENT ARRAY', children.map(child=>getTextContent(child)))
  //   // console.log('TexTcONTENT', textContent);
  //   let test = createHighlight(children, pattern, nodeName, className)
  //   // let newChildren = [];
  //   // children.forEach(child=>createHighlight(child, pattern).forEach(newChild=>newChildren.push(newChild)));
  //   return test;
  // }
  return createHighlight(children, pattern, nodeName, className)
}

export default Highlighter;