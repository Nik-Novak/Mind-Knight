import React from 'react';
import { Link } from 'react-router-dom';

function Button(props){
  return (
    <Link to={props.nav}>
      <span id={props.id} className='button-container'><button className={props.className} disabled={props.disabled} onClick={function(){}}>{props.children}</button></span> 
    </Link>
  );
}

export default Button;