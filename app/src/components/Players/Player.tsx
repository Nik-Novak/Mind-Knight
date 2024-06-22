"use client";
import { NumberOfPlayers, PlayerRole, PlayerSlot } from "@/types/game";
import { Stack, SxProps, Theme, Tooltip, TooltipProps, Typography } from "@mui/material";
import AcceptIcon from '@mui/icons-material/Check';
import RefuseIcon from '@mui/icons-material/Close';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HammerIcon from '@mui/icons-material/Hardware';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import NoVoteIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import VotedIcon from '@mui/icons-material/HelpCenter';
import { Player as DBPlayer, PlayerIdentity } from "@prisma/client";
import style from './players.module.css';
import style5 from './position-css/5man.module.css';
import style6 from './position-css/6man.module.css';
import style7 from './position-css/7man.module.css';
import style8 from './position-css/8man.module.css';
import { coloredText } from "@/utils/functions/jsx";
import Elo from "../Elo";
import { useStore } from "@/zustand/store";
import { CSSProperties, LegacyRef, ReactNode, useEffect, useState } from "react";
import { getDbPlayer } from "@/actions/game";

import agentBadge from './agent_badge.png';
import hackerBadge from './hacker_badge.png';
import { getSkinSrc } from "@/actions/skins";
import _ from "lodash";
import { SkinSrc } from "@/types/skins";
import ChatBubble from "../ChatBubble/ChatBubble";
import CustomSkinStats from "../CustomSkinStats";

const roleToBadgeMap = {
  [PlayerRole.agent]: agentBadge,
  [PlayerRole.admin]: agentBadge,
  [PlayerRole.hacker]: hackerBadge,
  [PlayerRole.scriptie]: hackerBadge,
  [PlayerRole.nuker]: hackerBadge,
}

export const styleMap = {
  5: style5,
  6: style6,
  7: style7,
  8: style8,
}


type Props = {
  sx?: CSSProperties,
  playerImgSx?: CSSProperties,
  playerInfoSx?: CSSProperties,
  slot: PlayerSlot,
  numPlayers: NumberOfPlayers,
  username: string,
  color: string,
  playerIdentity?: PlayerIdentity,
  isPropped?: boolean,
  isShadowed?: boolean,
  selected?: boolean,
  hasAction?: boolean,
  hasHammer?: boolean,
  isDisconnected?: boolean,
  voted?: boolean,
  accepted?: boolean,
  proppedIndex?: number, //true=accepted, false=rejected, undefined=novote
  chatMsg?: string,
  typing?: boolean,
  idle?: boolean,
  role?: PlayerRole,
  skin?: string,
  eloIncrement?: number,
  children?:ReactNode
}

function getChatPlacement(slot:PlayerSlot, numPlayers:NumberOfPlayers):TooltipProps['placement']{
  switch(numPlayers){
    case 5: {
      if([0, 1].includes(slot))
        return "right-start"
    } break;
    case 6: {
      if([0, 1, 2].includes(slot))
        return "right-start"
    } break;
    case 7: {
      if([0, 1, 2].includes(slot))
        return "right-start"
    } break;
    case 8: {
      if([0, 1, 2, 3].includes(slot))
        return "right-start"
    } break;
  }
  return "left-start"
}

export default function Player({ sx, playerImgSx, playerInfoSx, slot, role, numPlayers, username, color, playerIdentity, selected=false, isPropped=false, isShadowed=false, hasAction=false, hasHammer=false, isDisconnected=false, voted, accepted, proppedIndex, chatMsg, typing, idle, skin, eloIncrement, children }:Props){
  const positionalStyle = styleMap[numPlayers];
  const setSelectedSlot = useStore(state=>state.setSelectedSlot);
  const chatPlacement = getChatPlacement(slot, numPlayers);
  let votedIcon; //undefined=novote
  if(voted===true) //accepted
    votedIcon = <VotedIcon className={style.votedIcon} sx={{color:'#BC883C', left:chatPlacement === 'right-start' ? '75%' : ''}} />
  else if(voted === false) //rejected
    votedIcon = <NoVoteIcon className={style.votedIcon} sx={{color:'#ADADAD', left:chatPlacement === 'right-start' ? '75%' : ''}} />
  let voteIcon; //undefined=novote
  if(accepted===true) //accepted
    voteIcon = <AcceptIcon className={style.voteIcon} sx={{color:'green'}} />
  else if(accepted === false) //rejected
    voteIcon = <RefuseIcon className={style.voteIcon} sx={{color:'red'}} />

  const [dbPlayer, setDbPlayer] = useState<DBPlayer>();
  const [skinSrc, setSkinSrc] = useState<SkinSrc>();
  const [imgWidth, setImgWidth] = useState(0);
  useEffect(()=>{
    if(playerIdentity)
      (async ()=>{
          let dbPlayer = await getDbPlayer(playerIdentity);
          if(dbPlayer)
            setDbPlayer(dbPlayer);
          if(dbPlayer.equipped_skin){
            let skinSrc = await getSkinSrc(dbPlayer.equipped_skin);
            setSkinSrc(skinSrc);
          }
      })();
  }, [playerIdentity?.Steamid]);
  const isFacingRight = getChatPlacement(slot, numPlayers) === 'left-start';

  // await new Promise((res)=>setTimeout(res, 10000));
  // return <PlayerSkeleton slot={0} numPlayers={5} />
  return (
    <ChatBubble placement={chatPlacement} typing={typing} chatMsg={chatMsg} idle={idle}>
      <div style={sx} className={`${style.playerContainer} ${positionalStyle.playerContainer} ${selected ? style.selected :''} ${isPropped ? style.isPropped :''} ${isShadowed ? style.isShadowed :''}`} data-index={slot}>
        {children}
        <div style={playerImgSx} className={style.playerImg} /*onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}*/ onClick={()=>hasAction && setSelectedSlot(slot)}>
          <Tooltip
            placement="bottom"
            // disableInteractive
            disableHoverListener={!skinSrc?.custom_skin}
            arrow
            title={<Stack alignItems={'center'}>
                <Typography variant="h5">Custom Skin</Typography>
                {skinSrc?.custom_skin && <CustomSkinStats customSkin={skinSrc.custom_skin} /> }
              </Stack>
            }>
              <img
              style={playerImgSx}
                className="skin"
                src={skinSrc?.src || `/img/skins/${skin}.png`}
                alt="player"
                onError={(e) => {
                  e.currentTarget.src = '/img/skins/_locked.png'; // Replace '/img/fallback.png' with your fallback URL
                }}
              />
          </Tooltip>
          { role && roleToBadgeMap[role] && 
            <Tooltip title={_.capitalize(PlayerRole[role])} disableInteractive>
              {/* <img style={{width:'12px'}} src={roleToBadgeMap[role].src} alt="badge" className={style.badge} /> */}
              <img style={{
                  position:'absolute',
                  userSelect: 'none',
                  width:skinSrc?.custom_skin ? skinSrc.custom_skin.badge_width*12/3 : '12px', 
                  left:skinSrc?.custom_skin ? isFacingRight ? `${(skinSrc.custom_skin.badge_coords[0]*42.5/14)}%` : `${100-skinSrc.custom_skin.badge_width*14/3-(skinSrc.custom_skin.badge_coords[0]*42.5/14)}%`: '42.5%',
                  // right:getChatPlacement(slot, numPlayers) === 'left-start' ? skinSrc?.custom_skin ? `${(skinSrc.custom_skin.badge_coords[0]*42.5/14)}%`: '42.5%' : undefined,
                  top:skinSrc?.custom_skin ? `${skinSrc.custom_skin.badge_coords[1]*31/20}%` : '31%',
                }} 
                src={roleToBadgeMap[role].src} 
                alt="badge"
                onResize={(e)=>console.log(e.currentTarget.width)}
              />
            </Tooltip>
          }
          <Tooltip title="This player has an action available to view" placement="left" arrow>
            {/* <i className={`action-exists-icon fas fa-exclamation ${hasAction?'':'hidden'}`}></i> */}
            <PriorityHighIcon sx={{visibility: !hasAction?'hidden':undefined,}} className={style.actionExistsIcon} onClick={()=>hasAction && setSelectedSlot(slot)} />
          </Tooltip>
          {votedIcon && <Tooltip title={`This player has ${voted ? 'voted' : 'NOT voted yet'}`} placement={chatPlacement === 'right-start' ? 'right' : 'left'} arrow>
            {votedIcon}
          </Tooltip>}
          <Tooltip title="This player has hammer" placement="left" arrow>
            {/* <i className={`hammer-icon fas fa-hammer ${hasHammer?'':'hidden'}`}></i> */}
            <HammerIcon sx={{visibility: !hasHammer?'hidden':undefined}} className={style.hammerIcon} />
          </Tooltip>
          <Tooltip title="This player is disconnected" placement="right" arrow>
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
        <div style={playerInfoSx} className={style.playerInfo}>
          <Typography className="player-username">{coloredText(username, color)}</Typography>
          { playerIdentity && <Typography className="player-steamname">{`${playerIdentity.Nickname} (${playerIdentity.Level})`}</Typography> }
          <Elo elo={dbPlayer?.elo} eloIncrement={eloIncrement} />
        </div>
      </div>
    </ChatBubble>
  )
}

// export default suspense(Player, 'loading...')
