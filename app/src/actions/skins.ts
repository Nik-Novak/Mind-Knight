"use server";
import fs from 'fs';
import { getServerSession } from "next-auth";
import { database } from "../../prisma/database/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CustomSkinInfoSelect, SkinSrc } from '@/types/skins';
import { verifyIsAdmin } from './admin';
import { Prisma } from '@prisma/client';

const customSkinSelect:CustomSkinInfoSelect/* TODO type this properly :Prisma.CustomSkinSelect<InternalArgs & Prisma.Result<typeof database.customSkin, undefined, 'create'>>*/ = {
  approved:true,
  base64_data:true,
  created_at:true,
  description:true,
  id:true,
  name:true,
  owner:{
    include:{
      user:true
    }
  },
  owner_id:true,
  unlocked_game_ids:true,
  updated_at:true,
  unlocked_players:true,
  unlocked_games:{
    omit:{
      $addChatMessage:true,
      $addChatUpdate:true,
      $addConnectionUpdate:true,
      $addIdleStatusUpdate:true,
      $addVoteMade:true,
      $endGame:true,
      $endMission:true,
      $endProposal:true,
      $endVote:true,
      $spawnPlayer:true,
      $startGame:true,
      $startMission:true,
      $startProposal:true,
      $startVote:true,
      $syncRemote:true,
      $updateProposalSelection:true,
      chat:true,
      context:true,
      game_end:true,
      game_players:true,
      game_start:true,
      missions:true
    }
  }
}

export async function uploadCustomSkin(name:string, description:string, base64_data:string){
  const session = await getServerSession(authOptions);
  const owner_id = session?.user.player_id;
  if(!owner_id)
    throw Error("Must be logged in to upload skins.");
  return database.customSkin.create({data:{ approved:true, owner_id, unlocked_player_ids:[owner_id], name:name.toLowerCase().replaceAll(' ', '_'), description, base64_data}})
}

export async function getCustomSkins(){
  const session = await getServerSession(authOptions);
  const owner_id = session?.user.player_id;
  let unlocked = await database.customSkin.findMany({where:{unlocked_player_ids:{has:owner_id}}, select:customSkinSelect});
  let locked = await database.customSkin.findMany({where:{NOT:{unlocked_player_ids:{has:owner_id}}}, select:customSkinSelect});
  return {unlocked, locked}
}

export async function getTotalCustomSkins(){
  return database.customSkin.count();
}

// export async function getCustomSkins(){
//   return database.customSkin.findMany({select:customSkinSelect});
// }

export async function getEquippedSkin(){
  const session = await getServerSession(authOptions);
  const player_id = session?.user.player_id;
  return player_id && (await database.player.findById(player_id)).equipped_skin || undefined
}

export async function getSkins(){
  let skins = fs.readdirSync('public/img/skins').filter(s=>!s.startsWith('_')).map(s=>s.replaceAll('.png', ''));
  return skins;
}

export async function getSkinSrc(name:string):Promise<SkinSrc|undefined>{
  const session = await getServerSession(authOptions);
  const player_id = session?.user.player_id;
  let gameskinPath = 'public/img/skins/'+name+'.png';
  if(fs.existsSync(gameskinPath))
    return {name, src:gameskinPath.substring(gameskinPath.indexOf('/'))};
  let customSkin = await database.customSkin.findFirst({
    where:{name},
    select:customSkinSelect
  });
  if(!customSkin) return undefined;
  let notApprovedAndNotYours = !customSkin.approved && customSkin.owner_id!==player_id ;
  if(notApprovedAndNotYours) return undefined;
  return { src:customSkin?.base64_data, name, custom_skin:customSkin }
}

export async function approveSkin(name:string){
  if(!verifyIsAdmin())
    throw Error("Must have a valid NTF Admin badge to approve skins");
  await database.customSkin.update({where:{name}, data:{ approved:true }});
}

export async function revokeSkinApproval(name:string){
  if(!verifyIsAdmin())
    throw Error("Must have a valid NTF Admin badge to approve skins");
  await database.customSkin.update({where:{name}, data:{ approved:false }});
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
  await database.player.update({where:{id:player_id}, data:{ equipped_skin: null }});
}