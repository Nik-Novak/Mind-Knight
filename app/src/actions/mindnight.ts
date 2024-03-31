import { post } from "@/lib/fetch";
import { database } from "@/utils/database/database";
import { Client } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { machineId } from "node-machine-id";

export async function sendToMindnight(packet:JsonObject){
  await post('/mindnight/send', packet);
}

let cachedUUID:string | undefined;
export async function getClient(){
  if(!cachedUUID)
    cachedUUID = await machineId(); //TODO generate uuid and store in root if fails
  let client = await database.client.findOrCreate({data:{uuid:cachedUUID}, include:{mindnight_session:true}}); //await database.client.findFirst({where:{}, include:{mindnight_session:true}});
  return client;
}

export async function getMindnightSession(){
  "use server";
  let client = await getClient();
  console.log('client:', client);
  return client.mindnight_session;
}

export async function createMindnightSession(){
  "use server";
  if(!cachedUUID)
    cachedUUID = await machineId(); //TODO generate uuid and store in root if fails
  let client = await database.client.findOrCreate({data: {uuid:cachedUUID}, include:{mindnight_session:true}});
  return client.mindnight_session;
}