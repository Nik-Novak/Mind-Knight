"use server";
import { database } from "@/database";
import { getLastGameWith } from "./game";
import { GamesInfoSelect } from "@/types/games";
import { LeaderboardSelect} from "@/types/leaderboard";
import { auth } from "@/auth";

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
  // raw_games:true,
  updated_at:true,
  latest_log_time: true,
  source:true
};
const leaderboardsSelect:LeaderboardSelect= {
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
    select: gamesInfoSelect,
    take: 1
  }
};

let joshId:string|undefined;
async function efficientLeaderboardsQuery(playerId?:string, joshMode:boolean=false, offset:number=0, limit:number=50){
  let filterIds:string[] = [];
  if(playerId) filterIds.push(playerId);
  if(joshMode) {
    if(!joshId)
      joshId = (await database.player.findFirstOrThrow({where:{steam_id:'76561198814206069'}})).id; //fetch and cache josh's id
    filterIds.push(joshId);
  }
  
  let [leaderboards, total_records] = await database.player.findManyAndCount({
    where: {},
    orderBy:{
      elo:'desc'
    },
    select:{
      games:{
        orderBy:{
          game_found:{
            created_at:'asc'
          }
        },
        select: leaderboardsSelect,
        take: 1
      },
    },
    skip:offset,
    take:limit,
  });
  return {leaderboards, total_records};
}

export async function getLeaderboards(playerId?:string, joshMode:boolean=false, offset:number=0, limit:number=50){
  // const whereCondition = playerId ? { player_ids: { has: playerId } } : {};
  
  let {leaderboards, total_records} = await efficientLeaderboardsQuery(playerId, joshMode, offset, limit);
  // console.log('HERE', games[0].game_found.log_time);
  let response:PaginatedResponse<typeof leaderboards[0]> = {
    items: leaderboards,
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
  let session = await auth();
  if(!session) return undefined;
  let player = await database.player.findById(session.user.player_id);
  return player.elo;
}

export async function setVictoryPhrase(victory_phrase:string){
  let session = await auth();
  if(!session)
    throw Error("You must be signed in to edit a victory phrase.");
  await database.player.updateById(session.user.player_id, {data:{
    victory_phrase,
  }});
}