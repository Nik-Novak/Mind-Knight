import { WebSocketServer } from 'ws';
import type { ServerEventPacket, ServerEvents } from '@/types/events';
import { database } from '../prisma/database';
import { GlobalChatMessage } from './types/game';
import ProcessQueue from './utils/classes/ProcessQueue';


// import { getGame } from './actions/game'; //DO NOT IMPORT FROM HERE OR ANY ANNOTATED COMPONENT

console.log('instrumentation.ts');
console.log('PPID:', process.ppid);
console.log('PID:', process.pid);
const packetQueue = new ProcessQueue({autostart:true});
//const packetQueue = new Queue({autostart:true});

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

  // // TEST extensions
  // let test = await database.globalChatMessage.create({data:{Message: "TEst", SteamId:"123",Timestamp:121}});
  // // test.$toJson()
  // console.log(Object.keys(test));
  // test.Message = "heyo"
  // let returned = await test.$test({local:true});
  // console.log(Object.keys(returned));
  // console.log(test.Message); //confirmed that the data sis mutable on both sides
  // throw Error("STOP");
  
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
    packetQueue.push(
        async ()=>{
        await createGlobalChatMessage(packet.Message);
        sendServerEvent('ReceiveGlobalChatMessage', packet);
      },
      'ReceiveGlobalChatmessage'
    );
  });

  LogTail.on('PlayerInfo', async ( packet )=>{
    packetQueue.push(
        async ()=>{
        let mindnightSession = await createMindnightSession(packet);
        // revalidateTag(Tags.session.toString());
        sendServerEvent('MindnightSessionUpdate', mindnightSession);
        sendServerEvent('PlayerInfo', packet);
      }
    );
  });

  LogTail.on('AuthorizationRequest', async (packet)=>{
    packetQueue.push(
        async ()=>{
        // await sendToMindnight(packet); //TODO re-enable and deal with duplicate mindnightsessions
        sendServerEvent('AuthorizationRequest', packet);
      },
      'AuthorizationRequest'
    );
  });

  LogTail.on('AuthResponse', async (packet)=>{
    packetQueue.push(
      async ()=>{
        console.log('SHOULD AUTHENTICATE')
        let mindnightSession = await getMindnightSession();
        if(mindnightSession){
          let authedMindnightSession = await database.mindnightSession.authenticate(mindnightSession);
          console.log('Authenticated MNSession', mindnightSession);
          // revalidateTag(Tags.session);
          sendServerEvent('MindnightSessionUpdate', authedMindnightSession);
        }
        sendServerEvent('AuthResponse', packet);
      },
      'AuthResponse'
    );
  });


  LogTail.on('GlobalChatHistoryResponse', async (packet)=>{
    packetQueue.push(
      async ()=>{
        if(game)
          game = await game.$syncLocal(); //REMOTE UPDATE CHECKPOINT
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
      },
      'GlobalChatHistoryResponse'
    );
  });

  LogTail.on('GameClose', async ( packet )=>{
    packetQueue.push(
        async ()=>{
          if(game)
            game = await game.$syncLocal(); //REMOTE UPDATE CHECKPOINT
        let client = await getClient();
        if(client.mindnight_session)
          await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
        // revalidateTag(Tags.session.toString());
        sendServerEvent('MindnightSessionUpdate', null);
        sendServerEvent('GameClose', packet);
      },
      'GameClose'
    );
  });

  //building the game
  LogTail.on('GameFound', async (game_found, log_time)=>{
    packetQueue.push(
      async ()=>{
        game = await database.game.create({data:{
          game_found: {...game_found, log_time},
          game_players:{},
          missions:{},
          source: 'Live',
          latest_log_time: log_time
        }});
        let mindnightSession = await getMindnightSession();
        if(mindnightSession){
          let readiedMindnightSession = await database.mindnightSession.playing(mindnightSession);
          // revalidateTag(Tags.session);
          sendServerEvent('MindnightSessionUpdate', readiedMindnightSession);
        }
        sendServerEvent('GameUpdate', game);
      },
      'GameFound'
    );
  });
  LogTail.on('SpawnPlayer', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          game = await game.$spawnPlayer({args}) as Awaited<ReturnType<typeof database.game.create>>|undefined; //TODO figure out dyankmic typing for local:false
          sendServerEvent('GameUpdate', game);
        }
      },
      'SpawnPlayer'
    );
  });
  LogTail.on('GameStart', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            game = await game!.$startGame({args}) as Awaited<ReturnType<typeof database.game.create>>|undefined; //TODO figure out dyankmic typing for local:false
            sendServerEvent('GameUpdate', game);
          }, game.id, 'GameStart');
        }
      },
      'GameStart'
    );
  });
  LogTail.on('ChatMessageReceive', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game = */ await game!.$addChatMessage({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'ChatMessageReceive');
        }
      },
      'ChatMessageReceive'
    );
  });
  LogTail.on('ChatUpdate', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$addChatUpdate({args:args, local:true}); //purposely no attempt
          }, game.id)
        }
      },
      'ChatUpdate'
    );
  });
  
  LogTail.on('IdleStatusUpdate', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$addIdleStatusUpdate({args, local:true}); //purposely no attempt
          }, game.id)
        }
      },
      'IdleStatusUpdate'
    );
  });

  LogTail.on('Disconnected', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          /*game =*/ await game.$addConnectionUpdate({args, local:true});
        }
      },
      'Disconnected'
    );
  });
  LogTail.on('Reconnected', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          /*game =*/ await game.$addConnectionUpdate({args, local:true});
        }
      },
      'Reconnected'
    );
  });

  LogTail.on('SelectPhaseStart', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$startProposal({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'SelectPhaseStart');
        }
      },
      'SelectPhaseStart'
    );
  });
  LogTail.on('SelectUpdate', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$updateProposalSelection({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'SelectUpdate');
        }
      },
      'SelectUpdate'
    );
  });
  LogTail.on('SelectPhaseEnd', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$endProposal({args, local:true});
            game = await game!.$syncLocal(); // REMOTE UPDATE CHECKPOINT
            sendServerEvent('GameUpdate', game);
          }, game.id, 'SelectPhaseEnd');
        }
      },
      'SelectPhaseEnd'
    );
  });
  LogTail.on('VotePhaseStart', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$startVote({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'VotePhaseStart');
        }
      },
      'VotePhaseStart'
    );
  });
  LogTail.on('VoteMade', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$addVoteMade({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'VoteMade');
        }
      },
      'VoteMade'
    );
  });
  LogTail.on('VotePhaseEnd', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$endVote({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'VotePhaseEnd');
        }
      },
      'VotePhaseEnd'
    );
  });
  LogTail.on('MissionPhaseStart', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game){
          attempt(async ()=>{
            /*game =*/ await game!.$startMission({args, local:true});
            sendServerEvent('GameUpdate', game);
          }, game.id, 'MissionPhaseStart');
        }
      },
      'MissionPhaseStart'
    );
  });
  LogTail.on('MissionPhaseEnd', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game) {
          attempt(async ()=>{
            /*game =*/ await game!.$endMission({args, local:true});
            game = await game!.$syncLocal(); // REMOTE UPDATE CHECKPOINT
            sendServerEvent('GameUpdate', game);
          }, game.id, 'MissionPhaseEnd');
        }
      },
      'MissionPhaseEnd'
    );
  });
  LogTail.on('GameEnd', async (...args)=>{
    packetQueue.push(
      async ()=>{
        if(game) {
          attempt(async ()=>{
            /*game =*/ await game!.$endGame({args, local:true});
            game = await game!.$syncLocal(); //REMOTE UPDATE CHECKPOINT

            await database.rawGame.create({
              data: {
                upload_reason: 'GameEnd',
                data: LogTail.readLog(),
                game_id: game!.id
              }
            })

            sendServerEvent('GameUpdate', game);
          }, game.id, 'GameEnd');
        }
      },
      'GameEnd'
    );
    
  });

//TODO main menu wipe game

  // //INIT
  let client = await getClient();
  console.log('CLEINT', client.id);
  console.log('SESH', client.mindnight_session);
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

