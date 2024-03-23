import { NumberOfPlayers, PlayerSlot } from "@/types/game";
import { Tooltip, Typography } from "@mui/material";
import AcceptIcon from '@mui/icons-material/Check';
import RefuseIcon from '@mui/icons-material/Close';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import GavelIcon from '@mui/icons-material/Gavel';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { PlayerIdentity } from "@prisma/client";
import { database } from "@/utils/database/database";
import { suspense } from "@/utils/hoc/suspense";
import style from './players.module.css';
import style5 from './position-css/5man.module.css';
import style6 from './position-css/6man.module.css';
import style7 from './position-css/7man.module.css';
import style8 from './position-css/8man.module.css';
import { coloredText } from "@/utils/functions/jsx";
import Elo from "../Elo";

export const styleMap = {
  5: style5,
  6: style6,
  7: style7,
  8: style8,
}


type Props = {
  slot: PlayerSlot,
  numPlayers: NumberOfPlayers,
  username: string,
  color: string,
  playerIdentity?: PlayerIdentity,
  highlighted?: boolean,
  selected?: boolean,
  hasAction?: boolean,
  hasHammer?: boolean,
  isDisconnected?: boolean,
  vote?: 'accept'|'refuse',
  proppedIndex?: number,
}

async function Player({ slot, numPlayers, username, color, playerIdentity, selected=false, highlighted=false, hasAction=false, hasHammer=false, isDisconnected=false, vote, proppedIndex }:Props){
  const positionalStyle = styleMap[numPlayers];
  
  let voteIcon;
  if(vote==='accept')
    voteIcon = <AcceptIcon className={style.voteIcon} sx={{color:'green', fontSize:'32px', strokeWidth:'10px'}} />
  else if(vote === 'refuse')
    voteIcon = <RefuseIcon className={style.voteIcon} sx={{color:'red', fontSize:'32px'}} />

  let dbPlayer = playerIdentity && await database.player.findOrCreate(playerIdentity);
  let eloIncrement:number|undefined = -12;

  // await new Promise((res)=>setTimeout(res, 5000));
  // return <PlayerSkeleton slot={0} numPlayers={5} />

  return (
    <div className={`${style.playerContainer} ${positionalStyle.playerContainer} ${selected ? style.selected :''} ${highlighted ? style.highlighted :''}`} data-index={slot}>
      <div className={style.playerImg} /*onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}*/>
        <img src={'/img/skin-default.png'} alt="" /*onClick={onClick}*//>
        <Tooltip title="This player has an action available to view" placement="left" arrow>
          {/* <i className={`action-exists-icon fas fa-exclamation ${hasAction?'':'hidden'}`}></i> */}
          <PriorityHighIcon sx={{visibility: !hasAction?'hidden':undefined,}} className={style.actionExistsIcon} />
        </Tooltip>
        <Tooltip title="This player had hammer at the time of the shown proposal" placement="left" arrow>
          {/* <i className={`hammer-icon fas fa-hammer ${hasHammer?'':'hidden'}`}></i> */}
          <GavelIcon sx={{visibility: !hasHammer?'hidden':undefined}} className={style.hammerIcon} />
        </Tooltip>
        <Tooltip title="This player was disconnected at the time of the shown proposal" placement="right" arrow>
          <PowerOffIcon sx={{visibility: !isDisconnected?'hidden':undefined}} className={style.disconnectIcon} />
          {/* <i className={`disconnect-icon fas fa-plug ${isDisconnected ? '': 'hidden'}`}></i> */}
        </Tooltip>
        {voteIcon && <Tooltip title={`This player ${vote==='accept'?'accepted':'refused'} the shown proposal`} placement="right" arrow>
          {voteIcon}
          {/* <i className={`vote-icon fas ${voteIcon}`}></i> */}
        </Tooltip>}
        <Tooltip title={`This player proposed when there ${proppedIndex===1?'was':'were'} ${proppedIndex} node team${proppedIndex===1?'':'s'} rejected`} placement="right" arrow>
          <p className={style.propNumberContainer} style={{visibility: proppedIndex===undefined?'hidden':undefined}}><span className="prop-number">{proppedIndex}</span>/5</p>
        </Tooltip>
      </div>
      <div className={style.playerInfo}>
        <Typography className="player-username">{coloredText(username, color)}</Typography>
        { playerIdentity && <Typography className="player-steamname">{`${playerIdentity.Nickname} (${playerIdentity.Level})`}</Typography> }
        <Elo elo={dbPlayer?.elo} eloIncrement={eloIncrement} />
      </div>
    </div>
  )
}

export default suspense(Player, 'loading...')