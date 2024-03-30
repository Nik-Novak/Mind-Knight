import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import LogReader from '@/utils/classes/LogReader';
import { createGlobalChatMessage } from '@/actions/chat'

console.log('WS ROUTE.TS');
let wss:WebSocketServer | undefined;


LogReader.on('ReceiveGlobalChatMessage', async (packet)=>{
  await createGlobalChatMessage(packet.Message);
  wss?.clients.forEach(client=>{
    client.send(JSON.stringify({
      type: 'ReceiveGlobalChatMessage',
      payload: packet
    }))
  })
});
// LogReader.on('*', (eventName, ...args)=>{
//   wss?.clients.forEach(client=>{
//     client.send(JSON.stringify({
//       type: eventName,
//       payload: args
//     }))
//   })
// });

export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  wss = server;
  console.log('A client connected!');
  client.on('message', message => {
    console.log('Client sent:', message);
    // client.send(message);
  });
  
  client.on('close', () => {
    console.log('A client disconnected!');
  });
}