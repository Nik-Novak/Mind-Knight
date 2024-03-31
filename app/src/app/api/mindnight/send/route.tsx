import { LogEvents } from "@/utils/classes/LogReader";
import { JsonObject } from "@prisma/client/runtime/library";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

if(!process.env.MINDNIGHT_WS) throw Error('Must provide env MINDNIGHT_WS');

let mindnightWs:WebSocket|undefined;

function sendToMindnight(packet: JsonObject) {
  return new Promise<void>((resolve, reject)=>{
    if(mindnightWs === undefined || mindnightWs.readyState === WebSocket.CLOSED || mindnightWs.readyState === WebSocket.CLOSING){
      mindnightWs = new WebSocket(process.env.MINDNIGHT_WS!);
      mindnightWs.addEventListener('open', ()=>{ //standard opening sequence
        console.log('Successfully connected to Mindnight.');
        let keepAlivePacket:LogEvents['KeepAlive'][0] = {Type:-1};
        setInterval(()=>sendToMindnight(keepAlivePacket), 10_000);
      });
      mindnightWs.addEventListener('open', ()=>sendToMindnight(packet).then(resolve)); //queue the packet send
      mindnightWs.addEventListener('close', (ev)=>console.log(`Disconnected from Mindnight, reason: ${ev.reason}`));
      mindnightWs.addEventListener('message', (ev)=>console.log('Received from MN:', ev.data.toString()));
    }
    else if(mindnightWs.readyState === WebSocket.OPEN) { //connected, simply send
      mindnightWs.send(JSON.stringify(packet));
      return resolve();
    }
    else if(mindnightWs.readyState === WebSocket.CONNECTING) { //not open yet, queue the packet send
      mindnightWs.addEventListener('open', ()=>sendToMindnight(packet).then(resolve));
      return resolve();
    }
    else return reject("Something went horribly wrong");
  });
}

async function handler(request:NextRequest, res:Response ){
  let packet = await request.json();
  await sendToMindnight(packet);
  let response = `Sent to MN: ${JSON.stringify(packet, null, 2)}`;
  console.log(response);
  return new NextResponse(response, {status:200});
}

export {
  handler as POST
}