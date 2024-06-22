"use server";

import { auth } from '@/auth';

export async function verifyIsAdmin(){
  let session = await auth();
  if(!session?.user.steam_id)
    return false;
  let adminIds = process.env.ADMIN_STEAMIDS?.split(';');
  if(!adminIds) 
    return false;
  return adminIds.includes(session?.user.steam_id)
}