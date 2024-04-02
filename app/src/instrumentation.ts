import { WebSocketServer } from 'ws';
import type { ServerEventPacket, ServerEvents } from './components/ServerEventsProvider';
import { database } from './utils/database';
import { GlobalChatMessage } from './types/game';

console.log('instrumentation.ts');

async function createGlobalChatMessage(message:GlobalChatMessage){
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
  const { default:LogReader} = await import('./utils/classes/LogReader');
  

  if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
    throw Error("Must provide env NEXT_PUBLIC_SERVEREVENTS_WS");
  let wsUrl = new URL(process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
  let clientsWss = new WebSocketServer({
    // host: wsUrl.hostname,
    port: parseInt(wsUrl.port),
  });

  //INIT for clients;
  clientsWss.on('connection', async ()=>{
    let mindnightSession = await getMindnightSession();
    if(mindnightSession)
      sendServerEvent('MindnightSessionUpdate', mindnightSession);
  });

  const sendServerEvent = <T extends keyof ServerEvents>(eventName:T, payload:ServerEvents[T][0] )=>{
    clientsWss?.clients.forEach(client=>{
      let packet:ServerEventPacket = {
        type: eventName,
        payload: payload
      }
      client.send(JSON.stringify(packet));
    });
  }
  
  LogReader.on('ReceiveGlobalChatMessage', async (packet)=>{
    await createGlobalChatMessage(packet.Message);
    sendServerEvent('ReceiveGlobalChatMessage', packet);
  });

LogReader.on('PlayerInfo', async ( packet )=>{
  let mindnightSession = await createMindnightSession(packet);
  // revalidateTag(Tags.session.toString());
  sendServerEvent('MindnightSessionUpdate', mindnightSession);
  sendServerEvent('PlayerInfo', packet);
});

  LogReader.on('AuthorizationRequest', async (packet)=>{
    await sendToMindnight(packet);
    sendServerEvent('AuthorizationRequest', packet);
  });

LogReader.on('AuthResponse', async (packet)=>{
  let mindnightSession = await getMindnightSession();
  if(mindnightSession){
    let authedMindnightSession = await database.mindnightSession.authenticate(mindnightSession);
    console.log('Authenticated MNSession', mindnightSession);
    // revalidateTag(Tags.session);
    sendServerEvent('MindnightSessionUpdate', authedMindnightSession);
  }
  sendServerEvent('AuthResponse', packet);
});


LogReader.on('GlobalChatHistoryResponse', async (packet)=>{
  let mindnightSession = await getMindnightSession();
  if(mindnightSession){
    let readiedMindnightSession = await database.mindnightSession.ready(mindnightSession);
    // revalidateTag(Tags.session);
    sendServerEvent('MindnightSessionUpdate', readiedMindnightSession);
  }
  for (let message of packet.Messages){
    await database.globalChatMessage.findOrCreate({data:message});
  }
  sendServerEvent('GlobalChatHistoryResponse', packet);
});

// //INIT
let client = await getClient();
if(client.mindnight_session)
  await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
  
  
}
}

