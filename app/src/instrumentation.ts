import { WebSocketServer } from 'ws';
import type { ServerEventPacket, ServerEvents } from '@/types/events';
import { database } from '../prisma/database';
import { GlobalChatMessage } from './types/game';
import Queue from 'queue';

// import { getGame } from './actions/game'; //DO NOT IMPORT FROM HERE OR ANY ANNOTATED COMPONENT

console.log('instrumentation.ts');
console.log('PPID:', process.ppid);
console.log('PID:', process.pid);
const packetQueue = new Queue({autostart:true, concurrency:1 });

async function createGlobalChatMessage(message:GlobalChatMessage){
  let chatMsg = await database.globalChatMessage.create({
    data:message
  })
  // revalidateTag(Tags.chat)
  return chatMsg;
}

/**
 * This function runs once per server init. Other files run once per client usually.
 */
export async function register(){
if (process.env.NEXT_RUNTIME === 'nodejs') {

  const os = await import('os');
  const {getClient, getMindnightSession, sendToMindnight, createMindnightSession} = await import('@/actions/mindnight-session');
  // const {} = await import('@/actions/chat'); //for some reason we cant import from here
  console.log('i am running server side: ' + os.hostname);
  const { default:LogTail} = await import('./utils/classes/LogEvents/LogTailer');
  // const { LogReader} = await import('./utils/classes/LogEvents/LogReader');
  const { attempt } = await import('./utils/functions/error');

  if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
    throw Error("Must provide env NEXT_PUBLIC_SERVEREVENTS_WS");
  let wsUrl = new URL(process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
  let clientsWss = new WebSocketServer({
    // host: wsUrl.hostname,
    port: parseInt(wsUrl.port),
  });

  let game:Awaited<ReturnType<typeof database.game.create>>|undefined;
  
  //RECEIVE from clients;
  clientsWss.on('connection', async (socket)=>{
    // socket.on('ping', async ()=>{
      
    //   socket.pong();
    // });
    socket.on('message', async (data)=>{
      // if(data.toString().startsWith('ping'))
      //   return;
      let packet = JSON.parse(data.toString()) as ServerEventPacket;
      if(packet.type === 'GameUpdate'){
        let game_id = packet.payload.id as unknown;
        if(!game_id || typeof game_id !== 'string')
            throw Error('Could not retrieve game_id from packet payload');
        game = await database.game.findById(game_id);
        sendServerEvent('GameUpdate', game);
      }
      if(packet.type === 'ClientInit'){
        let mindnightSession = await getMindnightSession();
        if(mindnightSession)
          sendServerEvent('MindnightSessionUpdate', mindnightSession);
        // game = await database.game.findById('66144a8f577750ccbfab6f00');
        if(game)
          sendServerEvent('GameUpdate', game);
      }
    });
  });
  //END RECEIVE from clients;

  const sendServerEvent = <T extends keyof ServerEvents>(eventName:T, payload:ServerEvents[T][0] )=>{
    clientsWss?.clients.forEach(client=>{
      let packet:ServerEventPacket = {
        type: eventName,
        payload: payload
      }
      client.send(JSON.stringify(packet));
    });
  }
  
  LogTail.on('ReceiveGlobalChatMessage', async (packet)=>{
    packetQueue.push(async (cb)=>{
      await createGlobalChatMessage(packet.Message);
      sendServerEvent('ReceiveGlobalChatMessage', packet);
      cb && cb();
    });
  });

  LogTail.on('GameClose', async ( packet )=>{
    packetQueue.push(async (cb)=>{
      let client = await getClient();
      if(client.mindnight_session)
        await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
      // revalidateTag(Tags.session.toString());
      sendServerEvent('MindnightSessionUpdate', null);
      sendServerEvent('GameClose', packet);
      cb && cb();
    });
  });

  LogTail.on('PlayerInfo', async ( packet )=>{
    packetQueue.push(async (cb)=>{
      let mindnightSession = await createMindnightSession(packet);
      // revalidateTag(Tags.session.toString());
      sendServerEvent('MindnightSessionUpdate', mindnightSession);
      sendServerEvent('PlayerInfo', packet);
      cb && cb();
    });
  });

  LogTail.on('AuthorizationRequest', async (packet)=>{
    packetQueue.push(async (cb)=>{
      await sendToMindnight(packet);
      sendServerEvent('AuthorizationRequest', packet);
      cb && cb();
    });
  });

  LogTail.on('AuthResponse', async (packet)=>{
    packetQueue.push(async (cb)=>{
      let mindnightSession = await getMindnightSession();
      if(mindnightSession){
        let authedMindnightSession = await database.mindnightSession.authenticate(mindnightSession);
        console.log('Authenticated MNSession', mindnightSession);
        // revalidateTag(Tags.session);
        sendServerEvent('MindnightSessionUpdate', authedMindnightSession);
      }
      sendServerEvent('AuthResponse', packet);
      cb && cb();
    });
  });


  LogTail.on('GlobalChatHistoryResponse', async (packet)=>{
    packetQueue.push(async (cb)=>{
      let mindnightSession = await getMindnightSession();
      if(mindnightSession){
        let readiedMindnightSession = await database.mindnightSession.ready(mindnightSession);
        // revalidateTag(Tags.session);
        sendServerEvent('MindnightSessionUpdate', readiedMindnightSession);
      }
      for (let message of packet.Messages){
        await database.globalChatMessage.findOrCreate({data:message});
      }
      sendServerEvent('GlobalChatHistoryResponse', packet);
      cb && cb();
    });
    
  });

  //building the game
  LogTail.on('GameFound', async (game_found, log_time)=>{
    packetQueue.push(async (cb)=>{
        game = await database.game.create({data:{
        game_found: {...game_found, log_time},
        game_players:{},
        missions:{},
        source: 'live',
        latest_log_time: log_time
      }});
      let mindnightSession = await getMindnightSession();
      if(mindnightSession){
        let readiedMindnightSession = await database.mindnightSession.playing(mindnightSession);
        // revalidateTag(Tags.session);
        sendServerEvent('MindnightSessionUpdate', readiedMindnightSession);
      }
      sendServerEvent('GameUpdate', game);
      cb && cb();
    });
    
  });
  LogTail.on('SpawnPlayer', async (spawn_player, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        game = await game.$spawnPlayer(spawn_player, log_time);
        sendServerEvent('GameUpdate', game);
      }
      cb && cb();
    });
  });
  LogTail.on('GameStart', async (game_start, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$startGame(game_start, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'GameStart');
      }
      cb && cb()
    });
  });
  LogTail.on('ChatMessageReceive', async (chat_message, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$addChatMessage(chat_message, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'ChatMessageReceive');
      }
      cb && cb()
    });
  });
  LogTail.on('ChatUpdate', async (chat_update, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$addChatUpdate(chat_update, log_time); //purposely no attempt
        }, game.id)
      }
      cb && cb()
    });
  });
  
  LogTail.on('IdleStatusUpdate', async (idle_status_update, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$addIdleStatusUpdate(idle_status_update, log_time); //purposely no attempt
        }, game.id)
      }
      cb && cb()
    });
  });

  LogTail.on('Disconnected', async (disconnected, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        game = await game.$addConnectionUpdate(disconnected, log_time);
      }
      cb && cb()
    });
  });
  LogTail.on('Reconnected', async (reconnected, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        game = await game.$addConnectionUpdate(reconnected, log_time);
      }
      cb && cb()
    });
  });

  LogTail.on('SelectPhaseStart', async (select_phase_start, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$startProposal(select_phase_start, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'SelectPhaseStart');
      }
      cb && cb()
    });
  });
  LogTail.on('SelectUpdate', async (select_update, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$updateProposalSelection(select_update, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'SelectUpdate');
      }
      cb && cb()
    });
  });
  LogTail.on('SelectPhaseEnd', async (select_phase_end, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$endProposal(select_phase_end, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'SelectPhaseEnd');
      }
      cb && cb()
    });
    
  });
  LogTail.on('VotePhaseStart', async (vote_phase_start, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$startVote(vote_phase_start, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'VotePhaseStart');
      }
      cb && cb()
    });
  });
  LogTail.on('VoteMade', async (vote_made, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$addVoteMade(vote_made, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'VoteMade');
      }
      cb && cb()
    });
  });
  LogTail.on('VotePhaseEnd', async (vote_phase_end, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$endVote(vote_phase_end, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'VotePhaseEnd');
      }
      cb && cb()
    });
  });
  LogTail.on('MissionPhaseStart', async (mission_phase_start, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game){
        attempt(async ()=>{
          game = await game!.$startMission(mission_phase_start, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'MissionPhaseStart');
      }
      cb && cb()
    });
  });
  LogTail.on('MissionPhaseEnd', async (mission_phase_end, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game) {
        attempt(async ()=>{
          game = await game!.$endMission(mission_phase_end, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'MissionPhaseEnd');
      }
      cb && cb()
    });
  });
  LogTail.on('GameEnd', async (game_end, log_time)=>{
    packetQueue.push(async (cb)=>{
      if(game) {
        attempt(async ()=>{
          await database.rawGame.create({
            data: {
              upload_reason: 'GameEnd',
              data: LogTail.readLog(),
              game_id: game!.id
            }
          })
  
          game = await game!.$endGame(game_end, log_time);
          sendServerEvent('GameUpdate', game);
        }, game.id, 'GameEnd');
      }
      cb && cb()
    });
    
  });

//TODO main menu wipe game

  // //INIT
  let client = await getClient();
  if(client.mindnight_session)
    await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})

  // await database.rawGame.create({data:{
  //   data:LogReader.readLog(),
  //   upload_reason:'Error',
  //   game_id: '6617bcb47c283b8bf9f518d3'
  // }})
  }



// let games = await database.game.findMany();
// games.map(async game=>{
//   if(!game.game_end)
//     return null;
//   let playerIds = await Promise.all(game.game_end.PlayerIdentities.map(async playerIdentity=>{
//     let player = await database.player.findOrCreate({data:{
//       name:playerIdentity.Nickname,
//       steam_id: playerIdentity.Steamid,
//       level: playerIdentity.Level,
//     }}, {where:{steam_id:playerIdentity.Steamid}});
//     return player.id
//   }));
//   await database.game.update({where:{id: game.id}, data:{player_ids: playerIds}});
// })

}

