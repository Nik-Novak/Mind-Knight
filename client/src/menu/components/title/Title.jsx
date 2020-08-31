import React from 'react';
import './Title.css'

function Title(props){
  return (
    <div className="title-container">
      {props.children}
    </div>
  );
}

export default Title;