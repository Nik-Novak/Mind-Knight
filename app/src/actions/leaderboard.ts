import { database } from "@/database";
import { getLastGameWith } from "./game";

export async function getTop3Players(){
  let players = await database.player.findMany({orderBy:{elo:'asc'}, take:3});
  return Promise.all(players.map(async p=>{
    return {
      player: p,
      latest_game: await getLastGameWith(p)
    }
  }))
}