//@ts-check
import React from 'react';

function Version({local, remote, checkingContent, upToDateContent, outOfDateContent }){
  return (
    !local || !remote ? checkingContent : 
      local == remote ? upToDateContent : outOfDateContent
  );
}

export default Version;