"use server";
import { NodeNumber, PlayerSlot } from "@/types/game";
import { database } from "@/utils/database";
import { Game, PlayerIdentity } from "@prisma/client";



// async function init(){
//   game = await database.game.findById('660086081003d3d36367f840');
// }
// init();

// export async function getGame(){
//   // await database.game.findFirst({where:{ TODO: store game in db
//   //   game_end: null
//   // }})
//   let game = await database.game.findById('660086081003d3d36367f840');
//   return game;
// }

export async function getDbPlayer(playerIdentity: PlayerIdentity){
   return await database.player.findOrCreate({data:{
    name:playerIdentity.Nickname,
    steam_id: playerIdentity.Steamid,
    level: playerIdentity.Level,
  }}, {where:{steam_id:playerIdentity.Steamid}});
}