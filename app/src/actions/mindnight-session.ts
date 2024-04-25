import { post } from "@/lib/fetch";
import { database } from "../../prisma/database";
import { MindnightSessionStatus } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { machineId } from "node-machine-id";
import { LogSendEvents, ServerEventPacket, ServerEvents } from "@/types/events";
import { SocketConnection } from "@/utils/classes/LogEvents/SocketConnection";

// export async function sendToMindnight(packet:JsonObject){
//   await post('/mindnight/send', packet);
// }


let cachedUUID:string | undefined;
export async function getClient(){
  if(!cachedUUID)
    cachedUUID = await machineId(); //TODO generate uuid and store in root if fails
  let client = await database.client.createOrFind({data:{settings:{alpha_mode:false, josh_mode:false, streamer_mode:false}, uuid:cachedUUID}, include:{mindnight_session:true}}, {where:{uuid: cachedUUID}, include:{mindnight_session:true}})
  return client;
}

export async function getMindnightSession(){
  let client = await getClient();
  return client.mindnight_session;
}

export async function createMindnightSession(packet:ServerEvents['PlayerInfo'][0], authenticated_directly:boolean){
  let client = await getClient();
  let mindnightSession = await database.mindnightSession.create({data:{
    client_id: client.id,
    authenticated_directly,
    name: packet.Nickname,
    steam_id: packet.Steamid,
    status: MindnightSessionStatus.pending
  }});
  return mindnightSession;
}