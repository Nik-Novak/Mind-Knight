import { Prisma } from "@prisma/client"
import { GamesInfoSelect } from "./games"

export type LeaderboardSelect = {
  created_at:true,
  id: true,
  elo: true,
  equipped_skin: true,
  name:true,
  level:true,
  owned_custom_skins: true,
  unlocked_custom_skins: true,
  unlocked_custom_skin_ids: true,
  steam_id:true,
  game_ids:true,
  updated_at: true,
  user_id:true,
  victory_phrase: true,
  games:{
    select: GamesInfoSelect,
    take: 1
  }
}

export type LeaderboardPayload = Prisma.PlayerGetPayload<{select:LeaderboardSelect}>