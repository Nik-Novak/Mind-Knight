"use server";
import { database } from "@/database";
import { ClipsInfoSelect } from "@/types/clips";

const clipsInfoSelect:ClipsInfoSelect = {
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
};

let joshId:string|undefined;
async function efficientQuery(playerId?:string, joshMode:boolean=false, offset:number=0, limit:number=50){
  let filterIds:string[] = [];
  if(playerId) filterIds.push(playerId);
  if(joshMode) {
    if(!joshId)
      joshId = (await database.player.findFirstOrThrow({where:{steam_id:'76561198814206069'}})).id; //fetch and cache josh's id
    filterIds.push(joshId);
  }
  
  let [clips, total_records] = await database.clip.findManyAndCount({
    where: filterIds.length ? { game:{ player_ids:{ hasEvery: filterIds }} } : {},
    orderBy:{
      created_at:'desc'
    },
    select:clipsInfoSelect,
    skip:offset,
    take:limit,
  });
  return {clips, total_records};
}

export async function getClips(playerId?:string, joshMode:boolean=false, offset:number=0, limit:number=50){
  // const whereCondition = playerId ? { player_ids: { has: playerId } } : {};
  
  let {clips, total_records} = await efficientQuery(playerId, joshMode, offset, limit);
  // console.log('HERE', games[0].game_found.log_time);
  let response:PaginatedResponse<typeof clips[0]> = {
    items: clips,
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

export async function updateClipTitle(id:string, title:string){
  await database.clip.update({
    where:{
      id
    },
    data:{
      title
    }
  });
}

export async function createClip(title:string, game_id:string, player_id:string, offset_start:number, offset_end:number){
  return await database.clip.create({data:{
    title,
    player_id,
    game_id,
    offset_start,
    offset_end
  }});
}