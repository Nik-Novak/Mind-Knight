import { Player as DBPlayer } from "@prisma/client";
import Player from "../Players/Player";
import { SxProps, Theme } from "@mui/material";
import { CSSProperties } from "react";

type Props = {
  sx?:CSSProperties,
  playerImgSx?:CSSProperties,
  playerInfoSx?:CSSProperties,
  player:DBPlayer,
  direction?: 'left'|'right',
  highlighted?:boolean,
  skin?:string
}
export default function SimplePlayer({sx, playerImgSx, playerInfoSx, direction='right', player, skin, highlighted}:Props){
  return (
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
      // chatMsg=""
    />
  )
}