import { JsonObject } from "@prisma/client/runtime/library";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { WebSocket } from "ws";

if(!process.env.MINDNIGHT_WS) throw Error('Must provide env MINDNIGHT_WS');

const mindnightWs = new WebSocket(process.env.MINDNIGHT_WS);

mindnightWs.on('open', ()=>{
  console.log('Successfully connected to Mindnight.')
});

mindnightWs.on('close', (code, reason)=>{
  console.log(`Disconnected from Mindnight, reason: ${reason}`);
});

mindnightWs.on('message', (data)=>{
  console.log('Received from MN:', data.toString());
})

async function sendToMindnight(packet: JsonObject) {
  return await new Promise<void>((resolve, reject)=>{
    if(mindnightWs.readyState === 0) //not open yet
      mindnightWs.once('open', ()=>mindnightWs.send(JSON.stringify(packet), (err)=> err && reject(err) || resolve()));
    else
      mindnightWs.send(JSON.stringify(packet), (err)=> err && reject(err) || resolve());
  })
}

async function handler(request:NextRequest, res:Response ){
  let packet = await request.json();
  await sendToMindnight(packet);
  console.log('Sent to MN:', JSON.stringify(packet, null, 2));
  return new NextResponse("Packet sent.", {status:200});
}

export {
  handler as POST
}