import { Prisma } from "@prisma/client"

export type ClipsInfoSelect = {
  created_at: true,
  game:{
    select:{
      players:true,
      player_ids:true,
      game_found:true,
      game_end:true
    }
  },
  game_id:true,
  id:true,
  offset_end:true,
  offset_start:true,
  // player:true,
  player_id:true,
  title:true,
  updated_at:true,
}

export type ClipsInfoPayload = Prisma.ClipGetPayload<{select:ClipsInfoSelect}>