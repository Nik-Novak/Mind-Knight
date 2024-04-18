"use server";
import { machineId } from "node-machine-id";
import { database } from "../../prisma/database/database";
import { ClientSettings } from "@prisma/client";

let cachedUUID:string|undefined;
async function getClient(){
  if(!cachedUUID)
    cachedUUID = await machineId(); //TODO generate uuid and store in root if fails
  let client = await database.client.createOrFind({data:{uuid:cachedUUID, settings:{}}, include:{mindnight_session:true}}, {where:{uuid:cachedUUID}}); //await database.client.findFirst({where:{}, include:{mindnight_session:true}});
  return client;
}


export async function getRemoteSettings(){
  let client = await getClient();
  return client.settings
}

export async function updateRemoteSettings(update:Partial<ClientSettings>){
  let client = await getClient();
  let {settings} = await database.client.update({where:{id: client.id}, data:{
    settings:{
      update
    }
  }});
  return settings;
}