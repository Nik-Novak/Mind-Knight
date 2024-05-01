import { Prisma } from "@prisma/client"

export type GamesInfoSelect = {
  id:true,
  title:true,
  // chat:true,
  created_at:true,
  game_end:true,
  game_found:true,
  // game_players:true,
  // game_start:true,
  // missions:true,
  player_ids:true,
  players:true,
  // raw_games:true,
  updated_at:true,
  latest_log_time: true,
  source:true
}

export type GamesInfoPayload = Prisma.GameGetPayload<{select:GamesInfoSelect}>