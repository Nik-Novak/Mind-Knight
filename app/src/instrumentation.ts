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
  const {getClient, getMindnightSession, createMindnightSession} = await import('@/actions/mindnight-session');
  // const {} = await import('@/actions/chat'); //for some reason we cant import from here
  console.log('i am running server side: ' + os.hostname);
  const { LogTailer } = await import('./utils/classes/LogEvents/LogTailer');
  const { LogReader} = await import('./utils/classes/LogEvents/LogReader');
  const { MindnightConnection } = await import('./utils/classes/LogEvents/MindnightConnection');
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
      let packet = JSON.parse(data.toString()) as ServerEventPacket<keyof ServerEvents>;
      if(packet.type === 'GameUpdate'){
        let [updated_game] = packet.payload as ServerEventPacket<'GameUpdate'>['payload'];
        if(!updated_game?.id || typeof updated_game.id !== 'string')
            throw Error('Could not retrieve game_id from packet payload');
        game = await database.game.findById(updated_game.id);
        sendServerEvent('GameUpdate', [game]);
      }
      if(packet.type === 'Simulate'){
        let [logpath, timeBetweenLinesMS, startAtGameFound] = packet.payload as ServerEventPacket<'Simulate'>['payload'];
        let logReader = new LogReader({logpath, startAtLineContaining:startAtGameFound?'GameFound':undefined, timeBetweenLinesMS, onComplete:nLines=>console.log('Finished Simulation, read', nLines, 'lines')});
        new GameBuilder(logReader, 'checkpoints', sendServerEvent, createMindnightSession, getMindnightSession, getClient );
      }

      if(packet.type === 'ClientInit'){
        let mindnightSession = await getMindnightSession();
        if(mindnightSession)
          sendServerEvent('MindnightSessionUpdate', [mindnightSession]);
        // game = await database.game.findById('66144a8f577750ccbfab6f00');
        if(game)
          sendServerEvent('GameUpdate', [game]);
      }
      if(packet.type === 'SendToMindnight'){
        let [data] = packet.payload as ServerEventPacket<'SendToMindnight'>['payload'];
        await mnConnection.sendToMindnight(data);
      }
    });
  });
  //END RECEIVE from clients;

  const sendServerEvent = <T extends keyof ServerEvents>(eventName:T, payload:ServerEvents[T] )=>{
    clientsWss?.clients.forEach(client=>{
      let packet:ServerEventPacket<T> = {
        type: eventName,
        payload: payload
      }
      client.send(JSON.stringify(packet));
    });
  }

  let mnConnection = new MindnightConnection('_temp/Player.log');

  let logTailer = new LogTailer();
  // let logTailer = new LogTailer('_temp/Player.log');
  new GameBuilder(logTailer, 'checkpoints', sendServerEvent, createMindnightSession, getMindnightSession, getClient );

  logTailer.on('AuthorizationRequest', (auth)=>{
    console.log('INTERCEPTED AUTH', auth);
    mnConnection.sendToMindnight(auth);
  });
  mnConnection.on('AuthResponse', ()=>{
    console.log('AUTHENTICATED WITH MN!!!');
  });

  //INIT
  let client = await getClient();
  if(client.mindnight_session)
    await database.mindnightSession.delete({where:{id:client.mindnight_session.id}});
  
}
}

