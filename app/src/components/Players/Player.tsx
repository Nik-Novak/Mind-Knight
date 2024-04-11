"use client";
import { NumberOfPlayers, PlayerSlot } from "@/types/game";
import { Tooltip, Typography } from "@mui/material";
import AcceptIcon from '@mui/icons-material/Check';
import RefuseIcon from '@mui/icons-material/Close';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HammerIcon from '@mui/icons-material/Hardware';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { Player as DBPlayer, PlayerIdentity } from "@prisma/client";
import style from './players.module.css';
import style5 from './position-css/5man.module.css';
import style6 from './position-css/6man.module.css';
import style7 from './position-css/7man.module.css';
import style8 from './position-css/8man.module.css';
import { coloredText } from "@/utils/functions/jsx";
import Elo from "../Elo";
import { useStore } from "@/zustand/store";
import { useEffect, useState } from "react";
import { getDbPlayer } from "@/actions/game";

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
  accepted?: boolean,
  proppedIndex?: number, //true=accepted, false=rejected, undefined=novote
  // getDbPlayer: (playerIdentity: PlayerIdentity)=> Promise<Player>
}

export default function Player({ slot, numPlayers, username, color, playerIdentity, selected=false, highlighted=false, hasAction=false, hasHammer=false, isDisconnected=false, accepted, proppedIndex }:Props){
  const positionalStyle = styleMap[numPlayers];
  const setSelectedSlot = useStore(state=>state.setSelectedSlot);
  
  let voteIcon; //undefined=novote
  if(accepted===true) //accepted
    voteIcon = <AcceptIcon className={style.voteIcon} sx={{color:'green'}} />
  else if(accepted === false) //rejected
    voteIcon = <RefuseIcon className={style.voteIcon} sx={{color:'red'}} />

  const [dbPlayer, setDbPlayer] = useState<DBPlayer>();
  useEffect(()=>{
    if(playerIdentity)
      getDbPlayer(playerIdentity).then((dbPlayer)=>setDbPlayer(dbPlayer));
  }, [playerIdentity?.Steamid])

  let eloIncrement:number|undefined = 12;

  // await new Promise((res)=>setTimeout(res, 10000));
  // return <PlayerSkeleton slot={0} numPlayers={5} />

  return (
    <div className={`${style.playerContainer} ${positionalStyle.playerContainer} ${selected ? style.selected :''} ${highlighted ? style.highlighted :''}`} data-index={slot}>
      <div className={style.playerImg} /*onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}*/ onClick={()=>hasAction && setSelectedSlot(slot)}>
        <img src={'/img/skin-default.png'} alt="" /*onClick={onClick}*//>
        <Tooltip title="This player has an action available to view" placement="left" arrow>
          {/* <i className={`action-exists-icon fas fa-exclamation ${hasAction?'':'hidden'}`}></i> */}
          <PriorityHighIcon sx={{visibility: !hasAction?'hidden':undefined,}} className={style.actionExistsIcon} />
        </Tooltip>
        <Tooltip title="This player had hammer at the time of the shown proposal" placement="left" arrow>
          {/* <i className={`hammer-icon fas fa-hammer ${hasHammer?'':'hidden'}`}></i> */}
          <HammerIcon sx={{visibility: !hasHammer?'hidden':undefined}} className={style.hammerIcon} />
        </Tooltip>
        <Tooltip title="This player was disconnected at the time of the shown proposal" placement="right" arrow>
          <PowerOffIcon sx={{visibility: !isDisconnected?'hidden':undefined}} className={style.disconnectIcon} />
          {/* <i className={`disconnect-icon fas fa-plug ${isDisconnected ? '': 'hidden'}`}></i> */}
        </Tooltip>
        {voteIcon && <Tooltip title={`This player ${accepted===true?'accepted':'refused'} the shown proposal`} placement="right" arrow>
          {voteIcon}
          {/* <i className={`vote-icon fas ${voteIcon}`}></i> */}
        </Tooltip>}
        <Tooltip title={`This player proposed when there ${proppedIndex===1?'was':'were'} ${proppedIndex} node team${proppedIndex===1?'':'s'} rejected`} placement="right" arrow>
          <Typography className={style.propNumberContainer} style={{visibility: proppedIndex===undefined?'hidden':undefined}}><span className="prop-number">{proppedIndex}</span>/5</Typography>
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

// export default suspense(Player, 'loading...')