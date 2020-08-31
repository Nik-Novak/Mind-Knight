//@ts-check
import React from 'react';
import { Tooltip } from '@material-ui/core';

function TurnSelector({index, selected, onClick=null}){
  return (
      <div className={`round-button ${selected?'selected':''}`} index={index} onClick={onClick}>
        <Tooltip title={`Turn ${index}`} placement="bottom-start" arrow>
          <div className="round-button-circle">
            <a className="round-button"></a>
          </div>
        </Tooltip>
      </div>
  );
}

export default TurnSelector