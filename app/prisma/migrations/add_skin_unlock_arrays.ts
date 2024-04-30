import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url).split('/').findLast(()=>true) || ''; // get the resolved path to the file
const __dirname = path.dirname(__filename).split('/').findLast(()=>true); // get the name of the directory
import { database } from "../database/database";

console.log('STARTING MIGRATION', __filename);


await database.game.updateMany({data:{
  unlocked_custom_skin_ids:[]
}});
await database.customSkin.updateMany({data:{
  unlocked_game_ids:[]
}});


console.log('COMPLETED MIGRATION', __filename);