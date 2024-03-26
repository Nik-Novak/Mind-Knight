'use server';
import { GlobalChatMessage } from "@/types/game";
import { send } from "./websocket";
import LogReader, { LogEvents } from "@/utils/classes/LogReader";
import { revalidatePath } from "next/cache";


const globalChat:GlobalChatMessage[] = [];

LogReader.on('ReceiveGlobalChatMessage', (globalMessage)=>{
  globalChat.push(globalMessage.Message);
  revalidatePath('/');
})

export async function getGlobalChat(){
  console.log('GET GLOBAL', globalChat)
  return globalChat;
}

export async function sendGlobalMessage(message:string){
  if(!message)
    throw Error('Cannot send empty message');
  let payload:LogEvents['SendGlobalChatMessage'][0] = {
    Type: 901,
    Message: message
  }
  await send(payload)
  globalChat.push({
    Message: message,
    SteamId: '76561199656324830',
    Username: 'why',
    Roles: [0],
    Timestamp: Date.now()
  });
  revalidatePath('/');
  console.log('SEND GLOBAL', message)
  return globalChat;
}