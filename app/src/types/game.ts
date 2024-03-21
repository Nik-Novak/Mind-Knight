import { GamePlayers, Missions } from '@prisma/client'
export type PlayerSlot = keyof GamePlayers
export type NodeNumber = keyof Missions