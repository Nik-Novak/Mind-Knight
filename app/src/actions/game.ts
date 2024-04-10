"use server";
import { NodeNumber, PlayerSlot } from "@/types/game";
import { database } from "../../prisma/database";
import { Game, PlayerIdentity } from "@prisma/client";


export async function getGames(playerId:string){
  return await database.game.findMany({
    where:{
      player_ids: {has:playerId}
    },
    orderBy:{
      created_at:'desc'
    },
    select:{
      id:true,
      chat:true,
      created_at:true,
      game_end:true,
      game_found:true,
      game_players:true,
      game_start:true,
      missions:true,
      player_ids:true,
      players:true,
      raw_games:true,
      updated_at:true,
    }
  })
}

export async function getPlayer(steamId:string){
  return await database.player.findFirstOrThrow({
    where:{
      steam_id: steamId
    }
  });
}

export async function getDbPlayer(playerIdentity: PlayerIdentity){
   return await database.player.findOrCreate({data:{
    name:playerIdentity.Nickname,
    steam_id: playerIdentity.Steamid,
    level: playerIdentity.Level,
  }}, {where:{steam_id:playerIdentity.Steamid}});
}