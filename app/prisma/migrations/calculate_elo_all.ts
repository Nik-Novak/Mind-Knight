import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url).split('/').findLast(()=>true) || ''; // get the resolved path to the file
const __dirname = path.dirname(__filename).split('/').findLast(()=>true); // get the name of the directory
import { database } from "../database/database";
import { Elo } from '@/utils/classes/Elo';
import { ServerEvents } from '@/types/events';

console.log('STARTING MIGRATION', __filename);

await database.player.updateMany({data:{elo:1500}});

const games = await database.game.findMany();

for (let game of games){
  if(!game.game_end?.PlayerIdentities)
    continue;
  console.log('Loaded game with ID:', game.id);
  await new Elo(game.game_end as ServerEvents['GameEnd']['0']).updateElo();
  console.log('Elo Update Complete:', game.id);
}

console.log('COMPLETED MIGRATION', __filename);