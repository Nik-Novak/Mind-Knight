"use server";

import { getServerSession } from "next-auth";
import { database } from "../../prisma/database/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function uploadCustomSkin(name:string, description:string, base64_data:string){
  const session = await getServerSession(authOptions);
  const owner_id = session?.user.player_id;
  if(!owner_id)
    throw Error("Must be logged in to upload skins.");
  return database.customSkin.create({data:{ owner_id, player_ids:[owner_id], name:name.toLowerCase().replaceAll(' ', '_'), description, base64_data}})
}

export async function getUnlockedCustomSkins(){
  const session = await getServerSession(authOptions);
  const owner_id = session?.user.player_id;
  return database.customSkin.findMany({where:{owner_id}, include:{ owner:true }})
}