import { ChatMessage, GamePlayers, Missions,  } from '@prisma/client'
export type PlayerSlot = keyof GamePlayers
export type NumberOfPlayers = 5|6|7|8;
export type NodeNumber = keyof Missions
export enum PlayerRole {
  agent = 10,
  admin = 11,
  hacker = 20,
  scriptie = 21,
  nuker = 22
}
export enum GameMode {
  default = 0,
  blind_hackers = 1,
  mainframe = 2
}
export enum GameMap {
  subway = 11,
  backalley = 21,
  subway_winter = 12,
  backalley_winter = 22,
  hideout_hacked = 31,
  skatepark = 41,
  sewer = 51,
  ntf_agency = 61,
  desert = 71,
  // hideout = 4,
  hong_kong = 81,
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