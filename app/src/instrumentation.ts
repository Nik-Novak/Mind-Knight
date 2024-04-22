import { WebSocketServer } from 'ws';
import type { LogEvents, ServerEventPacket, ServerEvents } from '@/types/events';
import { database } from '../prisma/database';
import ProcessQueue from './utils/classes/ProcessQueue';
import { GameBuilder } from './utils/classes/GameBuilder';


// import { getGame } from './actions/game'; //DO NOT IMPORT FROM HERE OR ANY ANNOTATED COMPONENT

console.log('instrumentation.ts');
console.log('PPID:', process.ppid);
console.log('PID:', process.pid);
const packetQueue = new ProcessQueue({autostart:true});
//const packetQueue = new Queue({autostart:true});

async function createGlobalChatMessage(message:LogEvents['ReceiveGlobalChatMessage']['0']['Message']){
  let chatMsg = await database.globalChatMessage.create({
    data:message
  })
  // revalidateTag(Tags.chat)
  return chatMsg;
}

/**
 * This function runs once per server init. Other files run once per client usually.
 */
export async function register(){
if (process.env.NEXT_RUNTIME === 'nodejs') {

  const os = await import('os');
  const {getClient, getMindnightSession, sendToMindnight, createMindnightSession} = await import('@/actions/mindnight-session');
  // const {} = await import('@/actions/chat'); //for some reason we cant import from here
  console.log('i am running server side: ' + os.hostname);
  const { default:LogTail} = await import('./utils/classes/LogEvents/LogTailer');
  const { LogReader} = await import('./utils/classes/LogEvents/LogReader');
  // const { LogReader} = await import('./utils/classes/LogEvents/LogReader');
  const { attempt } = await import('./utils/functions/error');

  if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
    throw Error("Must provide env NEXT_PUBLIC_SERVEREVENTS_WS");
  let wsUrl = new URL(process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
  let clientsWss = new WebSocketServer({
    // host: wsUrl.hostname,
    port: parseInt(wsUrl.port),
  });

  let game:Awaited<ReturnType<typeof database.game.create>>|undefined;

  // // TEST extensions
  // let test = await database.globalChatMessage.create({data:{Message: "TEst", SteamId:"123",Timestamp:121}});
  // // test.$toJson()
  // console.log(Object.keys(test));
  // test.Message = "heyo"
  // let returned = await test.$test({local:true});
  // console.log(Object.keys(returned));
  // console.log(test.Message); //confirmed that the data sis mutable on both sides
  // throw Error("STOP");
  
  //RECEIVE from clients;
  clientsWss.on('connection', async (socket)=>{
    // socket.on('ping', async ()=>{
      
    //   socket.pong();
    // });
    socket.on('message', async (data)=>{
      // if(data.toString().startsWith('ping'))
      //   return;
      let packet = JSON.parse(data.toString()) as ServerEventPacket;
      if(packet.type === 'GameUpdate'){
        let game_id = packet.payload.id as unknown;
        if(!game_id || typeof game_id !== 'string')
            throw Error('Could not retrieve game_id from packet payload');
        game = await database.game.findById(game_id);
        sendServerEvent('GameUpdate', game);
      }
      if(packet.type === 'Simulate'){
        let [logpath, timeBetweenLinesMS] = packet.payload;
        let logReader = new LogReader({logpath, startAtLineContaining:'GameFound', timeBetweenLinesMS, onComplete:nLines=>console.log('Finished Simulation, read', nLines, 'lines')});
        new GameBuilder(logReader, 'checkpoints', sendServerEvent, createMindnightSession, getMindnightSession, getClient );
      }

      if(packet.type === 'ClientInit'){
        let mindnightSession = await getMindnightSession();
        if(mindnightSession)
          sendServerEvent('MindnightSessionUpdate', mindnightSession);
        // game = await database.game.findById('66144a8f577750ccbfab6f00');
        if(game)
          sendServerEvent('GameUpdate', game);
      }
    });
  });
  //END RECEIVE from clients;

  const sendServerEvent = <T extends keyof ServerEvents>(eventName:T, payload:ServerEvents[T][0] )=>{
    clientsWss?.clients.forEach(client=>{
      let packet:ServerEventPacket = {
        type: eventName,
        payload: payload
      }
      client.send(JSON.stringify(packet));
    });
  }
  
  new GameBuilder(LogTail, 'checkpoints', sendServerEvent, createMindnightSession, getMindnightSession, getClient );
  
  }

}

