"use server";
import fs from 'fs';
import { getServerSession } from "next-auth";
import { database } from "../../prisma/database/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function uploadCustomSkin(name:string, description:string, base64_data:string){
  const session = await getServerSession(authOptions);
  const owner_id = session?.user.player_id;
  if(!owner_id)
    throw Error("Must be logged in to upload skins.");
  return database.customSkin.create({data:{ owner_id, unlocked_player_ids:[owner_id], name:name.toLowerCase().replaceAll(' ', '_'), description, base64_data}})
}

export async function getUnlockedCustomSkins(){
  const session = await getServerSession(authOptions);
  const owner_id = session?.user.player_id;
  return database.customSkin.findMany({where:{owner_id}, include:{ owner:true }})
}

export async function getEquippedSkin(){
  const session = await getServerSession(authOptions);
  const player_id = session?.user.player_id;
  return player_id && (await database.player.findById(player_id)).equipped_skin
}

export async function getSkins(){
  let skins = fs.readdirSync('public/img/skins').map(s=>s.replaceAll('.png', ''));
  return skins;
}

export async function getSkin(name:string){
  let gameskinPath = 'public/img/skins/'+name+'.png';
  if(fs.existsSync(gameskinPath))
    return gameskinPath.substring(gameskinPath.indexOf('/'));
  return (await database.customSkin.findFirst({where:{name}}))?.base64_data;
}

export async function equipSkin(name:string){
  const session = await getServerSession(authOptions);
  const player_id = session?.user.player_id;
  if(!player_id)
      throw Error("Must be logged in to equip a skin.");
  await database.player.update({where:{id:player_id}, data:{ equipped_skin: name }});
}

export async function unequipSkin(){
  const session = await getServerSession(authOptions);
  const player_id = session?.user.player_id;
  if(!player_id)
      throw Error("Must be logged in to unequip a skin.");
  await database.player.update({where:{id:player_id}, data:{ equipped_skin: undefined }});
}