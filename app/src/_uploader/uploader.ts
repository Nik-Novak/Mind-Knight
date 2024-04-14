
import { LogReader } from "@/utils/classes/LogEvents/LogReader";
// import { database } from "../../prisma/database";

async function run(){
  let filepath = '__test__/data/coin_gods/Player.log';
  console.log('TEST');
  // console.log(await database.player.findFirst());
  let logReader = new LogReader({logpath: filepath, timeBetweenLinesMS:100});
  logReader.on('ChatMessageReceive', (chat_message, log_time)=>{
    console.log('FOUND CHAT', chat_message);
  })
}

run();