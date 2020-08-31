//@ts-check
import React from 'react';
import { connect, useDispatch } from 'react-redux'
import { setTooltips, setAdvancedStats, setAdvancedTurnScrollLock, setDisplayUsernames, setScrollToChat } from '../../../redux/actions/settings-actions'
import './AdvancedOptions.css';
import { Checkbox, FormControlLabel, Tooltip } from '@material-ui/core';

function AdvancedOptions({settings,  style=undefined}){
  const dispatch = useDispatch();
  return (
    <div className="advanced-options" style={style}>
      <ul>
        <li>
          <Tooltip title="Enable or disable these tooltips" placement="right" arrow>
            <FormControlLabel label="Tooltips" control={<Checkbox color="default" checked={settings.tooltips} onChange={(event)=>dispatch(setTooltips(event.target.checked))}/>}/>
          </Tooltip>
        </li>
        <li>
          <Tooltip title="Toggles display of advanced node and proposal stats when hovering over node selectors and player icons respectively" placement="right" arrow>
            <FormControlLabel label="Advanced Stats" control={<Checkbox color="default" checked={settings.game.advanced_stats} onChange={(event)=>dispatch(setAdvancedStats(event.target.checked))}/>}/>
          </Tooltip>
        </li>
        <li>
          <Tooltip title="Locks the current turn when using the scroll wheel to traverse through proposals in a given node" placement="right" arrow>
            <FormControlLabel label="Turn Scroll Lock" control={<Checkbox color="default" checked={settings.game.turn_scroll_lock} onChange={(event)=>dispatch(setAdvancedTurnScrollLock(event.target.checked))}/>}/>
          </Tooltip>
        </li>
        <li>
          <Tooltip title="Displays each player's Steam name and level when available" placement="right" arrow>
            <FormControlLabel label="Display Usernames" control={<Checkbox color="default" checked={settings.game.display_usernames} onChange={(event)=>dispatch(setDisplayUsernames(event.target.checked))}/>}/>
          </Tooltip>
        </li>
        <li>
          <Tooltip title="When an action(prop or pass) is selected, scroll to show the chat content at the time of the action" placement="right" arrow>
            <FormControlLabel label="Scroll to Chat" control={<Checkbox color="default" checked={settings.game.scroll_to_chat} onChange={(event)=>dispatch(setScrollToChat(event.target.checked))}/>}/>
          </Tooltip>
        </li>
      </ul>
    </div>
  );
}

export default AdvancedOptions;