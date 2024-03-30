import { post } from "@/lib/fetch";
import { JsonObject } from "@prisma/client/runtime/library";

export async function sendToMindnight(packet:JsonObject){
  await post('/mindnight/send', packet);
}