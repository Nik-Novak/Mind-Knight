//@ts-check
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

function NodeSelector({index, selected, size, status, onClick, onMouseEnter, onMouseLeave}){
  return (
  <Tooltip title={`Node ${index}`} placement="left" arrow>
    <div className={`round-button ${selected?'selected':''}`} index={index} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="round-button-circle" status={status}>
        <a className="round-button">{size}</a>
      </div>
    </div>
  </Tooltip>
  );
}

export default NodeSelector