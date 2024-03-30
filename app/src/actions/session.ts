"use server";
import LogReader, { LogEvents } from "@/utils/classes/LogReader";
import { revalidatePath } from "next/cache";
import Steam from 'steam-client';

type MindnightSession = {
  name: string,
  steamId: string,
  status: 'pending'|'authenticated'|'menu'
}
let session:MindnightSession|undefined; //TODO make this a call to ws to check

export async function getMindnightSession(){
  return session;
}

// const steamClient = new Steam.CMClient();
// steamClient.

LogReader.on('PlayerInfo', ( {Nickname, Steamid} )=>{
  session = {
    name: Nickname,
    steamId: Steamid,
    status: 'pending'
  }
});

LogReader.on('AuthResponse', ()=>{
  if(session)
    session.status = 'authenticated';
  revalidatePath('/');
});

LogReader.on('GlobalChatHistoryResponse', ()=>{
  if(session)
    session.status = 'menu';
  revalidatePath('/');
});

// const steamUser = new SteamUser();

// async function steamLogin(username: string, password: string): Promise<{sessionTicket:string}>{
//   return new Promise((resolve, reject)=>{
//     steamClient.on('loggedOn', () => {
//       console.log("Login Successful");
//       steamClient.on('accountInfo', async (name:string)=>{
//         let {sessionTicket} = await steamClient.createAuthSessionTicket(667870);
//         resolve({ sessionTicket: sessionTicket.toString() });
//       });
      
//     });
//   });
// }

/*
TODO: HANDLE STEAMGUARD
.on('steamGuard', (domain, callback,lastCodeWrong )=> {
      if(!lastCodeWrong){

          console.log("Steam Guard code needed from email ending in " + domain);
          rl.question("Code : ",(answer)=>{
              callback(answer);
          })
      }
      else{
          // the code is wrong re-request it?
      }
      
  })
*/

// export async function login(username:string, password:string){
//   await new Promise<void>(async (resolve, reject)=>{
//     let {sessionTicket} = await steamLogin(username, password);

//     let payload:LogEvents['AuthorizationRequestPacket'][0] = {
//       Type: 801,
//       SteamTicket: sessionTicket,
//       ClientToken: '2.15-2ac2e086-1704-4651-bfc6-36cc28d0f4d8'
//     }

//     LogReader.on('AuthResponse', ()=>{
//       loggedIn = true;
//       revalidatePath('/login');
//       resolve();
//     });
//     send(payload);
//   });
// }