"use server";
import { GlobalChatMessage } from "@/types/game";
import { revalidateTag, unstable_cache as cache, revalidatePath } from "next/cache";
import { database } from "../../prisma/database";
import { Tags } from "@/utils/cache/tags";
import { getMindnightSession, sendToMindnight } from "./mindnight-session";
import { LogEvents } from "@/types/events";



export async function createGlobalChatMessage(message:GlobalChatMessage){
  let chatMsg = await database.globalChatMessage.create({
    data:message
  })
  // revalidateTag(Tags.chat)
  // revalidatePath('/')
  // console.log('SHOULD BE REVALIDATED');
  return chatMsg;
}

export const getGlobalChat = cache( async function (){
    let chat = await database.globalChatMessage.findMany({orderBy:{Timestamp:'asc'}});
    return chat;
  }, 
  [Tags.chat],
  { tags: [Tags.chat] }
);

export async function sendGlobalMessage(message:string){
  if(!message)
    throw Error('Cannot send empty message');
  let mindnightSession = await getMindnightSession();
  if(!mindnightSession)
    throw Error("Cannot send global chat with no mindnight_session");
  let payload:LogEvents['SendGlobalChatMessage'][0] = {
    Type: 901,
    Message: message
  }
  await sendToMindnight(payload);
  let chatMsg = await createGlobalChatMessage({
    Message: message,
    SteamId: mindnightSession.steam_id,
    Username: mindnightSession.name,
    Roles: [0],
    Timestamp: Date.now()
  });
  return chatMsg;
}