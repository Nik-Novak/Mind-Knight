'use server';
import { JsonObject } from "@prisma/client/runtime/library";
import { promisify } from "util";
import {WebSocket} from 'ws'
if(!process.env.MINDNIGHT_WS) throw Error('Must provide env MINDNIGHT_WS');

const ws = new WebSocket(process.env.MINDNIGHT_WS, { perMessageDeflate:false });

ws.on('open', ()=>{
  console.log('Successfully connected to Mindnight.')
});

ws.on('close', (code, reason)=>{
  console.log(`Disconnected from Mindnight, reason: ${reason}`);
});

ws.on('message', (data)=>{
  console.log('Received:', data.toString());
})

export async function send(packet: JsonObject) {
  return await new Promise<void>((resolve, reject)=>{
    resolve();
    // ws.send(JSON.stringify(packet), (err)=> err && reject(err) || resolve(packet));
  })
}