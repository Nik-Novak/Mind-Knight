import { database } from "@/database";
import { getLastGameWith } from "./game";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getTop3Players(){
  let players = await database.player.findMany({orderBy:{elo:'desc'}, take:3});
  return Promise.all(players.map(async p=>{
    return {
      player: p,
      latest_game: await getLastGameWith(p)
    }
  }))
}

export async function getMyElo(){
  let session = await getServerSession(authOptions);
  if(!session) return undefined;
  let player = await database.player.findById(session.user.player_id);
  return player.elo;
}