"use server";
import { NodeNumber, PlayerSlot } from "@/types/game";
import { database } from "../../prisma/database";
import { Game, PlayerIdentity } from "@prisma/client";
import { getServerSession } from "next-auth";
import LogTailer from "@/utils/classes/LogEvents/LogTailer";
import { ServerEventPacket } from "@/types/events";

export async function getGames(playerId?:string, offset:number=0, limit:number=50){
  const whereCondition = playerId ? { player_ids: { has: playerId } } : {};
  return await database.game.findMany({
    where: whereCondition,
    orderBy:{
      created_at:'desc'
    },
    select:{
      id:true,
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
      source:true,
    },
    skip:offset,
    take:limit,
  })
}

export async function uploadGames(){
  let session = await getServerSession();
  let firstLog = LogTailer.readLog();
  if(!firstLog)
    throw Error('Something went wrong.');
  await database.rawGame.create({data:{
    data: firstLog,
    upload_reason:'Upload',
    context: `${session?.user.steam_id} Player.log`,
    game_id: '000000000000000000000000'
  }});
  let secondLog = LogTailer.readPrevLog();
  if(secondLog)
    await database.rawGame.create({data:{
      data: secondLog,
      upload_reason:'Upload',
      context: `${session?.user.steam_id} Player-prev.log`,
      game_id: '000000000000000000000000'
    }});
}

export async function updateGameOnServer(game: Game){
  return new Promise<void>((resolve, reject)=>{
    if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
        throw Error('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS');
    const tempSocket = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
    tempSocket.onopen = ()=>{
      let packet:ServerEventPacket = {
        type:'GameUpdate',
        payload: game
      }
      tempSocket.send(JSON.stringify(packet));
      resolve()
    }
  });
}

export async function getPlayer(steamId:string){
  return await database.player.findFirstOrThrow({
    where:{
      steam_id: steamId
    }
  });
}

export async function getDbPlayer(playerIdentity: PlayerIdentity){
   return await database.player.createOrFind({data:{
    name:playerIdentity.Nickname,
    steam_id: playerIdentity.Steamid,
    level: playerIdentity.Level,
  }}, {where:{steam_id:playerIdentity.Steamid}});
}