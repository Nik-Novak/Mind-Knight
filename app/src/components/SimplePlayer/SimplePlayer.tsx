"use client";
import { Player as DBPlayer } from "@prisma/client";
import Player from "../Players/Player";
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CSSProperties, useRef, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import ContextMenu, { MenuAction } from "../ContextMenu";


type Props = {
  sx?:CSSProperties,
  playerImgSx?:CSSProperties,
  playerInfoSx?:CSSProperties,
  player:DBPlayer,
  direction?: 'left'|'right',
  highlighted?:boolean,
  skin?:string,
  sessionPlayerId?: string,
  actions?:MenuAction[],
}
export default function SimplePlayer({sx, playerImgSx, playerInfoSx, direction='right', player, skin, highlighted, sessionPlayerId, actions}:Props){
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <Player
        sx={sx}
        playerImgSx={playerImgSx}
        playerInfoSx={playerInfoSx}
        color="#ffffff"
        numPlayers={5}
        slot={direction === 'right' ? 0 : 2}
        username={''}
        playerIdentity={{Level:player.level, Nickname:player.name, Steamid:player.steam_id, Slot:0}}
        skin={skin}
        isPropped={highlighted}
        chatMsg={player.victory_phrase || undefined}
      >
        <div style={{position:'relative', top:-20, right:-50}} ref={menuContainerRef}>
          <IconButton sx={{position:'absolute', background:'rgba(255,255,255,0.2)'}} onClick={()=>{
            setIsContextMenuOpen(true);
          }}>
            <MoreVertIcon />
          </IconButton>
          <ContextMenu 
            open={isContextMenuOpen} 
            actions={actions} 
            anchorEl={menuContainerRef.current}
            ownerId={player.id} 
            onClose={()=>setIsContextMenuOpen(false)} 
          />
        </div>
      </Player>
    </>
  )
}