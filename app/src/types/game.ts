import { ChatMessage, GamePlayers, Missions,  } from '@prisma/client'
export type PlayerSlot = keyof GamePlayers
export type NumberOfPlayers = 5|6|7|8;
export type NodeNumber = keyof Missions
export enum PlayerRole {
  agent = 10,
  hacker = 20
}
export enum GameMode {
  default = 0
}
export enum GameMap {
  sewer = 11 //idk if this is true, just an example
}
export enum NamingConvention {
  default = 0
}
export type GlobalChatMessage = {
  Message:string, //"i couldve easily bussed u there",
  SteamId:string, //"76561199508846872",
  Username:string, //"Accily",
  Roles:number[], //[0],
  Timestamp:number, //1711309357
}