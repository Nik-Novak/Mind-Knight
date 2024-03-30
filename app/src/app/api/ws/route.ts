import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import LogReader from '@/utils/classes/LogReader';
import { createGlobalChatMessage } from '@/actions/chat'
import { JsonObject } from '@prisma/client/runtime/library';

console.log('WS ROUTE.TS');
let clientsWss:WebSocketServer | undefined;

LogReader.on('ReceiveGlobalChatMessage', async (packet)=>{
  await createGlobalChatMessage(packet.Message);
  clientsWss?.clients.forEach(client=>{
    client.send(JSON.stringify({
      type: 'ReceiveGlobalChatMessage',
      payload: packet
    }))
  });
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