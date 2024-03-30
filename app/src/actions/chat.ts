'use server';
import { GlobalChatMessage } from "@/types/game";
import { LogEvents } from "@/utils/classes/LogReader";
import { revalidateTag, unstable_cache as cache, revalidatePath } from "next/cache";
import { database } from "@/utils/database/database";
import { Tags } from "@/utils/cache/tags";
import { sendToMindnight } from "./mindnight";



export async function createGlobalChatMessage(message:GlobalChatMessage){
  "use server";
  let chatMsg = await database.globalChatMessage.create({
    data: message
  });
  revalidateTag(Tags.chat)
  // revalidatePath('/')
  // console.log('SHOULD BE REVALIDATED');
  return chatMsg;
}

export const getGlobalChat = cache( async function (){
    "use server";
    let chat = await database.globalChatMessage.findMany();
    return chat;
  }, 
  [Tags.chat],
  { tags: [Tags.chat] }
);

export async function sendGlobalMessage(message:string){
  "use server";
  if(!message)
    throw Error('Cannot send empty message');
  let payload:LogEvents['SendGlobalChatMessage'][0] = {
    Type: 901,
    Message: message
  }
  await sendToMindnight(payload)
  let chatMsg = await createGlobalChatMessage({
    Message: message,
    SteamId: '76561199656324830',
    Username: 'why',
    Roles: [0],
    Timestamp: Date.now()
  });
  return chatMsg;
}