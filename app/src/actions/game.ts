import { NodeNumber, PlayerSlot } from "@/types/game";
import { database } from "@/utils/database";
import { Game } from "@prisma/client";

let game:Game|undefined;

// async function init(){
//   game = await database.game.findById('660086081003d3d36367f840');
// }
// init();

export async function getGame(){
  // await database.game.findFirst({where:{ TODO: store game in db
  //   game_end: null
  // }})
  game = await database.game.findById('660086081003d3d36367f840');
  return game;
}

export function getSelectedNode():NodeNumber|undefined{
  return 1;
}
export function getSelectedTurn():number{
  return 1 || 1; //default this one
}
export function getSelectedSlot():PlayerSlot|undefined{
  return 0;
}