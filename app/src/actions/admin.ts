"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function verifyIsAdmin(){
  let session = await getServerSession(authOptions);
  if(!session?.user.steam_id)
    return false;
  let adminIds = process.env.ADMIN_STEAMIDS?.split(';');
  if(!adminIds) 
    return false;
  return adminIds.includes(session?.user.steam_id)
}