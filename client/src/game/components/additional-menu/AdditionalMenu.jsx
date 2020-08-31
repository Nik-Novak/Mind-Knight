import React from 'react';
import './AdditionalMenu.css';

function AdditionalMenu(){
  return (
    <div className="button-container">
      <a href="https://image.ibb.co/idENnq/help.png" target="_blank"><button className="help-button">Help</button></a>
      <a href="https://docs.google.com/spreadsheets/u/0/" target="_blank"><button className="notes-button">Quick Notes</button></a>
    </div>
  );
}

export default AdditionalMenu;