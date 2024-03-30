import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import LogReader from '@/utils/classes/LogReader';
import { createGlobalChatMessage } from '@/actions/chat'
import { JsonObject } from '@prisma/client/runtime/library';
import { sendToMindnight } from '@/actions/mindnight';
import { notify } from '@/components/NotificationQueue';
import { ServerEventPacket, ServerEvents } from '@/components/ServerEventsProvider';

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

LogReader.on('ReceiveGlobalChatMessage', async (packet)=>{
  await createGlobalChatMessage(packet.Message);
  sendServerEvent('ReceiveGlobalChatMessage', packet);
});

LogReader.on('PlayerInfo', ( packet )=>{
  // session = {
  //   name: Nickname,
  //   steamId: Steamid,
  //   status: 'pending'
  // }
  sendServerEvent('PlayerInfo', packet);
});

LogReader.on('AuthorizationRequest', async (packet)=>{
  await sendToMindnight(packet);
  sendServerEvent('AuthorizationRequest', packet);
})

LogReader.on('AuthResponse', (packet)=>{
  // if(session)
  //   session.status = 'authenticated';
  // revalidatePath('/');
  sendServerEvent('AuthResponse', packet);
});

LogReader.on('GlobalChatHistoryResponse', (packet)=>{
  // if(session)
  //   session.status = 'menu';
  // revalidatePath('/');
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
    // client.send(message);
  });
  
  client.on('close', () => {
    console.log('A client disconnected!');
  });
}