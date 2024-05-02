"use server";
import fs from 'fs';
import { database } from "../../prisma/database";
import { Game, PlayerIdentity } from "@prisma/client";
import { getServerSession } from "next-auth";
import { ServerEventPacket } from "@/types/events";
import LogEventEmitter from '@/utils/classes/LogEvents/LogEventEmitter';
import { GamesInfoSelect } from '@/types/games';

const gamesInfoSelect:GamesInfoSelect = {
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
};

let joshId:string|undefined;
async function efficientGamesQuery(playerId?:string, joshMode:boolean=false, offset:number=0, limit:number=50){
  let filterIds:string[] = [];
  if(playerId) filterIds.push(playerId);
  if(joshMode) {
    if(!joshId)
      joshId = (await database.player.findFirstOrThrow({where:{steam_id:'76561198814206069'}})).id; //fetch and cache josh's id
    filterIds.push(joshId);
  }
  
  let [games, total_records] = await database.game.findManyAndCount({
    where: filterIds.length ? { player_ids: { hasEvery: filterIds } } : {},
    orderBy:{
      created_at:'desc'
    },
    select:gamesInfoSelect,
    skip:offset,
    take:limit,
  });
  return {games, total_records};

  // RAW
  // const [{ games, total_records }] = await database.game.aggregateRaw({
  //   pipeline:
  //     [
  //       { $match: playerId ? { player_ids: { $in:[playerId] } } : {} },
  //       { $sort: { created_at: -1 } },
  //       { $project: {
  //           id: 1,
  //           created_at: 1,
  //           game_end: 1,
  //           game_found: 1,
  //           player_ids: 1,
  //           players: 1,
  //           updated_at: 1,
  //           latest_log_time: 1,
  //           source: 1
  //         }
  //       },
  //       { $facet: {
  //           games: [{ $skip: offset }, { $limit: limit }],
  //           total_records: [{ $count: "total" }]
  //         }
  //       }
  //     ],
  //     options:{ allowDiskUse:true }
  // }) as any;
  // return { games, total_records: total_records[0]?.total || 0 } as {games:Game[], total_records:number};
}

export async function getGames(playerId?:string, joshMode:boolean=false, offset:number=0, limit:number=50){
  // const whereCondition = playerId ? { player_ids: { has: playerId } } : {};
  
  let {games, total_records} = await efficientGamesQuery(playerId, joshMode, offset, limit);
  // console.log('HERE', games[0].game_found.log_time);
  let response:PaginatedResponse<typeof games[0]> = {
    items: games,
    metadata: {
      current_page: Math.floor(offset / limit),
      has_next_page: offset < total_records,
      items_per_page: limit,
      total_items: total_records,
      total_pages: total_records / limit
    }
  }
  return response;
}

export async function updateGameTitle(gameId:string, title:string){
  await database.game.update({
    where:{
      id:gameId
    },
    data:{
      title
    }
  });
}

export async function reportGameIssue(gameId:string, issue:string){
  await database.game.update({
    where:{
      id:gameId
    },
    data:{
      issues:{push:issue}
    }
  });
}

const USINGFORLOGREADINGONLY = new LogEventEmitter();
export async function uploadGames(){
  let session = await getServerSession();
  let firstLog = USINGFORLOGREADINGONLY.readLog(); //TODO globalize/consolidate?
  if(!firstLog)
    throw Error('Something went wrong.');
  await database.rawGame.create({data:{
    data: firstLog,
    upload_reason:'Upload',
    context: `${session?.user.steam_id} Player.log`,
    game_id: '000000000000000000000000'
  }});
  let secondLog = USINGFORLOGREADINGONLY.readPrevLog(); //TODO globalize/consolidate?
  if(secondLog)
    await database.rawGame.create({data:{
      data: secondLog,
      upload_reason:'Upload',
      context: `${session?.user.steam_id} Player-prev.log`,
      game_id: '000000000000000000000000'
    }});
}

// export async function requestClientInit(){
//   return new Promise<void>((resolve, reject)=>{
//     if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS) throw reject('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS (connection to server ws for log events)');
//     const ws = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
//     ws.onopen = (t)=>{
//       let packet:ServerEventPacket<'ClientInit'> = {
//         type: 'ClientInit',
//         payload:[]
//       }
//       ws.send(JSON.stringify(packet)); //request init latest gamedata and session, etc.
//       resolve()
//     }
//   });
// }
export async function requestClientInit(){ //holy this is sensitive
  return new Promise<void>((resolve, reject)=>{
    if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
        return reject('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS');
    const tempSocket = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
    tempSocket.onopen = ()=>{
      let packet:ServerEventPacket<'ClientInit'> = {
        type:'ClientInit',
        payload: []
      }
      tempSocket.send(JSON.stringify(packet));
      resolve()
    }
  });
}
// export async function updateGameOnServer(game: Game){
//   return new Promise<void>((resolve, reject)=>{
//     if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
//         throw Error('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS');
//     const tempSocket = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
//     tempSocket.onopen = ()=>{
//       let packet:ServerEventPacket<'GameUpdate'> = {
//         type:'GameUpdate',
//         payload: [game]
//       }
//       tempSocket.send(JSON.stringify(packet));
//       resolve()
//     }
//   });
// }
async function requestServerSimulation(gameFilepath: string, timeBetweenLinesMS:number=100, startAtGameFound:boolean=false){
  return new Promise<void>((resolve, reject)=>{
    if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
        throw Error('Must provide env NEXT_PUBLIC_SERVEREVENTS_WS');
    const tempSocket = new WebSocket(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
    tempSocket.onopen = ()=>{
      let packet:ServerEventPacket<'Simulate'> = {
        type:'Simulate',
        payload: [gameFilepath, timeBetweenLinesMS, startAtGameFound]
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

export async function simulate(data:FormData){
  let log = data.get('file') as File;
  let timeBetweenLinesMS = data.get('time-between-lines-ms')?.toString();
  let startAtGameFound = Boolean(data.get('start-at-gamefound'));
  console.log('HERE', startAtGameFound);
  console.log('HERE', data.entries());
  if(!log || !timeBetweenLinesMS)
    throw Error('No log uploaded.');
  fs.writeFileSync('_temp/Player.log', await log.text());
  await requestServerSimulation('_temp/Player.log', parseInt(timeBetweenLinesMS), startAtGameFound);
}