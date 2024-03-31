import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import LogReader from '@/utils/classes/LogReader';
import { createGlobalChatMessage } from '@/actions/chat'
import { JsonObject } from '@prisma/client/runtime/library';
import { getClient, getMindnightSession, sendToMindnight } from '@/actions/mindnight';
import { notify } from '@/components/NotificationQueue';
import { ServerEventPacket, ServerEvents } from '@/components/ServerEventsProvider';
import { machineId } from 'node-machine-id';
import { database } from '@/utils/database/database';
import { revalidateTag } from 'next/cache';
import { Tags } from '@/utils/cache/tags';
import { MindnightSessionStatus } from '@prisma/client';
// This file acts as a global server function file (because NextJS doesnt have any stable server-side) as well as exporting a client socket for notifying client of server-side updates.
console.log('WS ROUTE.TS');




let clientsWss:WebSocketServer | undefined;

function sendServerEvent<T extends keyof ServerEvents>(eventName:T, payload:ServerEvents[T][0] ){
  clientsWss?.clients.forEach(client=>{
    let packet:ServerEventPacket = {
      type: eventName,
      payload: payload
    }
    client.send(JSON.stringify(packet));
  });
}

async function serverInit(){
  let client = await getClient();
  if(client.mindnight_session)
    await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
}
serverInit();

LogReader.on('ReceiveGlobalChatMessage', async (packet)=>{
  await createGlobalChatMessage(packet.Message);
  sendServerEvent('ReceiveGlobalChatMessage', packet);
});

LogReader.on('PlayerInfo', async ( packet )=>{
  let client = await getClient();
  let mindnightSession = await database.mindnightSession.create({data:{
    client_id: client.id,
    name: packet.Nickname,
    steam_id: packet.Steamid,
    status: MindnightSessionStatus.pending
  }});
  console.log('Created MNSession', mindnightSession);
  // revalidateTag(Tags.session);
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
    let newMindnightSession = await database.mindnightSession.authenticate(mindnightSession);
    console.log('Authenticated MNSession', mindnightSession);
    // revalidateTag(Tags.session);
    sendServerEvent('MindnightSessionUpdate', newMindnightSession);
  }
  sendServerEvent('AuthResponse', packet);
});

LogReader.on('GlobalChatHistoryResponse', async (packet)=>{
  let mindnightSession = await getMindnightSession();
  if(mindnightSession){
    let newMindnightSession = await database.mindnightSession.ready(mindnightSession);
    // revalidateTag(Tags.session);
    sendServerEvent('MindnightSessionUpdate', newMindnightSession);
  }
  sendServerEvent('GlobalChatHistoryResponse', packet);
});

export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  clientsWss = server;
  console.log('A client connected!');
  client.on('message', message => {
    console.log('Client sent:', message);
  });
  client.on('close', () => {
    console.log('A client disconnected!');
  });
}