import { PlayerSlot } from "@/types/game";
import { GamePlayers } from "@prisma/client";
import { Key } from "react";
import { ColorCode, colors } from "../constants/colors";

export function coloredText(text:string|undefined, color:string|undefined, key?:Key){
  //return null; //UNCOMMENT for _uploader
  return <span key={key} style={{color}}>{text}</span>;
}

export function getColoredUsername(game_players:GamePlayers, slot:PlayerSlot, key?: Key){
  let game_player = game_players[slot];
  let color = game_player?.Color!=undefined ? colors[game_player.Color as ColorCode].hex : '#fff'
  return coloredText(game_player?.Username, color, key);
}