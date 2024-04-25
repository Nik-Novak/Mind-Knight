import { LogSendEvents, ServerEventPacket } from "@/types/events";
import { SocketConnection } from "@/utils/classes/LogEvents/SocketConnection";

if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
  throw Error("Must provide env NEXT_PUBLIC_SERVEREVENTS_WS");
let serverWs = new SocketConnection(process.env.NEXT_PUBLIC_SERVEREVENTS_WS);
export async function sendToMindnight(packet:LogSendEvents[keyof LogSendEvents][0]){
  let serverPacket:ServerEventPacket<'SendToMindnight'> = {
    type:'SendToMindnight',
    payload:[packet]
  }
  serverWs.send(serverPacket);
}