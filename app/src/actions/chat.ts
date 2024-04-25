"use server";
import { GlobalChatMessage } from "@/types/game";
import { revalidateTag, unstable_cache as cache, revalidatePath } from "next/cache";
import { database } from "../../prisma/database";
import { Tags } from "@/utils/cache/tags";
import { getMindnightSession } from "./mindnight-session";
import { LogEvents, LogSendEvents } from "@/types/events";
import { sendToMindnight } from "./mindnight-connection";



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
    let chat = await database.globalChatMessage.findMany({orderBy:{Timestamp:'asc'}, take:20});
    return chat;
  }, 
  [Tags.chat],
  { tags: [Tags.chat] }
);

export async function sendGlobalMessage(message:string){
  "use server";
  if(!message)
    throw Error('Cannot send empty message');
  let mindnightSession = await getMindnightSession();
  if(!mindnightSession)
    throw Error("Cannot send global chat with no mindnight_session");
  if(!mindnightSession.authenticated_directly)
    throw Error("Cannot send global chat message without a direct mindnight authentication");
  let payload:LogSendEvents['SendGlobalChatMessage'][0] = {
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

export async function sendMessage(message:string){
  "use server";
  if(!message)
    throw Error('Cannot send empty message');
  let mindnightSession = await getMindnightSession();
  if(!mindnightSession)
    throw Error("Cannot send global chat with no mindnight_session");
  if(!mindnightSession.authenticated_directly)
    throw Error("Cannot send global chat message without a direct mindnight authentication");
  let payload:LogSendEvents['SendChat'][0] = {
    Type: 204,
    Message: message
  }
  await sendToMindnight(payload);
}