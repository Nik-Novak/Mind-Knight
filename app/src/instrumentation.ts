import { WebSocketServer } from "ws";
import LogReader from "./utils/classes/LogReader";
console.log('instrumentation.ts');

export let wss:WebSocketServer|undefined;

/**
 * This function runs once per server init. Other files run once per client usually.
 */
export async function register(){
  // throw Error('REGISTER');
  console.log('REGISTER!');
  // const wss = new WebSocketServer({ //need a wss to propagate events to client
  //   port: 5347
  // });
  // wss.on('connection', (ws)=>{
  //   ws.on('message', data=>{
  //     console.log('Received from Client:', data.toString());
  //   });
  // });

  // LogReader.on('PlayerInfo', ( {Nickname, Steamid} )=>{
  //   console.log('PlayerInfo');
  //   // session = {
  //   //   name: Nickname,
  //   //   steamId: Steamid,
  //   //   status: 'pending'
  //   // }
  // });
  
  // LogReader.on('AuthResponse', ()=>{
  //   console.log('Authresponse');
  //   // if(session)
  //   //   session.status = 'authenticated';
  //   // revalidatePath('/');
  // });
  
  // LogReader.on('GlobalChatHistoryResponse', ()=>{
  //   console.log('GLOBAL CHAT HISTORY');
  //   // if(session)
  //   //   session.status = 'menu';
  //   // revalidatePath('/');
  // });
}

