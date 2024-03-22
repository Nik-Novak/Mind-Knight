import { GamePlayers, Missions,  } from '@prisma/client'
export type PlayerSlot = keyof GamePlayers
export type NumberOfPlayers = 5|6|7|8;
export type NodeNumber = keyof Missions