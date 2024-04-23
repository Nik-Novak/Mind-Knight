import { LogEvents, LogReceiveEvents, LogSendEvents, ServerEvents } from "@/types/events";
import LogEventEmitter from "./LogEvents/LogEventEmitter";
import { GlobalChatMessage, MindnightSession, Prisma } from "@prisma/client";
import { database } from "../../../prisma/database/database";
import ProcessQueue from "./ProcessQueue";
import { attempt } from "../functions/error";
type SyncStrategy = 'local'|'checkpoints'|'remote';
type SendServerEventFnc = <T extends keyof LogSendEvents | keyof LogReceiveEvents | "MindnightSessionUpdate" | "GameUpdate" | "ClientInit">(eventName: T, payload: ServerEvents[T]) => void;
type CreateMindnightSessionFnc = (packet:ServerEvents['PlayerInfo'][0]) => Promise<MindnightSession>;
async function createGlobalChatMessage(message:LogEvents['ReceiveGlobalChatMessage']['0']['Message']){
  let chatMsg = await database.globalChatMessage.create({
    data:message
  })
  // revalidateTag(Tags.chat)
  return chatMsg;
}

export class GameBuilder {
  constructor(
    logInput:LogEventEmitter, 
    strategy:SyncStrategy, 
    sendServerEvent:SendServerEventFnc, 
    createMindnightSession:CreateMindnightSessionFnc,
    getMindnightSession:()=>Promise<MindnightSession|null>,
    getClient:()=>Promise<Prisma.ClientGetPayload<{include:{mindnight_session:true}}>>
  ){
    let game:Awaited<ReturnType<typeof database.game.create>>|undefined;
    const packetQueue = new ProcessQueue({autostart:true});
    
    logInput.on('ReceiveGlobalChatMessage', async (packet)=>{
      packetQueue.push(
          async ()=>{
          await createGlobalChatMessage(packet.Message);
          sendServerEvent('ReceiveGlobalChatMessage', [packet, new Date()]);
        },
        'ReceiveGlobalChatmessage'
      );
    });
  
    logInput.on('PlayerInfo', async ( packet )=>{
      packetQueue.push(
          async ()=>{
          let mindnightSession = await createMindnightSession(packet);
          // revalidateTag(Tags.session.toString());
          sendServerEvent('MindnightSessionUpdate', [mindnightSession]);
          sendServerEvent('PlayerInfo', [packet, new Date()]);
        }
      );
    });
  
    logInput.on('AuthorizationRequest', async (packet)=>{
      packetQueue.push(
          async ()=>{
          // await sendToMindnight(packet); //TODO re-enable and deal with duplicate mindnightsessions
          sendServerEvent('AuthorizationRequest', [packet, new Date()]);
        },
        'AuthorizationRequest'
      );
    });
  
    logInput.on('AuthResponse', async (packet)=>{
      packetQueue.push(
        async ()=>{
          // console.log('SHOULD AUTHENTICATE')
          let mindnightSession = await getMindnightSession();
          if(mindnightSession){
            let authedMindnightSession = await database.mindnightSession.authenticate(mindnightSession);
            // console.log('Authenticated MNSession', mindnightSession);
            // revalidateTag(Tags.session);
            sendServerEvent('MindnightSessionUpdate', [authedMindnightSession]);
          }
          sendServerEvent('AuthResponse', [packet, new Date()]);
        },
        'AuthResponse'
      );
    });

    logInput.on('GlobalChatHistoryResponse', async (packet)=>{
      packetQueue.push(
        async ()=>{
          if(game)
            await game.$syncRemote(); //REMOTE UPDATE CHECKPOINT
          let mindnightSession = await getMindnightSession();
          if(mindnightSession){
            let readiedMindnightSession = await database.mindnightSession.ready(mindnightSession);
            // revalidateTag(Tags.session);
            sendServerEvent('MindnightSessionUpdate', [readiedMindnightSession]);
          }
          for (let message of packet.Messages){
            await database.globalChatMessage.createOrFind({data:message});
          }
          sendServerEvent('GlobalChatHistoryResponse', [packet, new Date()]);
        },
        'GlobalChatHistoryResponse'
      );
    });
  
    logInput.on('GameClose', async ( packet )=>{
      packetQueue.push(
          async ()=>{
            if(game)
              await game.$syncRemote(); //REMOTE UPDATE CHECKPOINT
          let client = await getClient();
          if(client.mindnight_session)
            await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
          // revalidateTag(Tags.session.toString());
          sendServerEvent('MindnightSessionUpdate', [null]);
          sendServerEvent('GameClose', [packet]);
        },
        'GameClose'
      );
    });
  
    //building the game
    logInput.on('GameFound', async (game_found, log_time)=>{
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
            sendServerEvent('MindnightSessionUpdate', [readiedMindnightSession]);
          }
          sendServerEvent('GameUpdate', [game]);
        },
        'GameFound'
      );
    });

    logInput.on('SpawnPlayer', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            game = await game.$spawnPlayer({args}) as Awaited<ReturnType<typeof database.game.create>>|undefined; //TODO figure out dyankmic typing for local:false
            sendServerEvent('GameUpdate', [game]);
          }
        },
        'SpawnPlayer'
      );
    });
    logInput.on('GameStart', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              game = await game!.$startGame({args}) as Awaited<ReturnType<typeof database.game.create>>|undefined; //TODO figure out dyankmic typing for local:false
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'GameStart');
          }
        },
        'GameStart'
      );
    });
    logInput.on('ChatMessageReceive', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$addChatMessage({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'ChatMessageReceive');
          }
        },
        'ChatMessageReceive'
      );
    });
    logInput.on('ChatUpdate', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$addChatUpdate({args:args, local:true}); //purposely no attempt
              // Object.assign(game!, updates);
            }, game.id)
          }
        },
        'ChatUpdate'
      );
    });
    
    logInput.on('IdleStatusUpdate', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$addIdleStatusUpdate({args, local:true}); //purposely no attempt
              // Object.assign(game!, updates);
            }, game.id)
          }
        },
        'IdleStatusUpdate'
      );
    });
  
    logInput.on('Disconnected', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            let updates = await game.$addConnectionUpdate({args, local:true});
            // Object.assign(game!, updates);
          }
        },
        'Disconnected'
      );
    });
    logInput.on('Reconnected', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            let updates = await game.$addConnectionUpdate({args, local:true});
            // Object.assign(game!, updates);
          }
        },
        'Reconnected'
      );
    });
  
    logInput.on('SelectPhaseStart', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$startProposal({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'SelectPhaseStart');
          }
        },
        'SelectPhaseStart'
      );
    });
    logInput.on('SelectUpdate', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$updateProposalSelection({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'SelectUpdate');
          }
        },
        'SelectUpdate'
      );
    });
    logInput.on('SelectPhaseEnd', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$endProposal({args, local:true});
              // Object.assign(game!, updates);
              await game!.$syncRemote(); // REMOTE UPDATE CHECKPOINT
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'SelectPhaseEnd');
          }
        },
        'SelectPhaseEnd'
      );
    });
    logInput.on('VotePhaseStart', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$startVote({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'VotePhaseStart');
          }
        },
        'VotePhaseStart'
      );
    });
    logInput.on('VoteMade', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$addVoteMade({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'VoteMade');
          }
        },
        'VoteMade'
      );
    });
    logInput.on('VotePhaseEnd', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$endVote({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'VotePhaseEnd');
          }
        },
        'VotePhaseEnd'
      );
    });
    logInput.on('MissionPhaseStart', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game){
            attempt(async ()=>{
              let updates = await game!.$startMission({args, local:true});
              // Object.assign(game!, updates);
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'MissionPhaseStart');
          }
        },
        'MissionPhaseStart'
      );
    });
    logInput.on('MissionPhaseEnd', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game) {
            attempt(async ()=>{
              let updates = await game!.$endMission({args, local:true});
              // Object.assign(game!, updates);
              await game!.$syncRemote(); // REMOTE UPDATE CHECKPOINT
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'MissionPhaseEnd');
          }
        },
        'MissionPhaseEnd'
      );
    });
    logInput.on('GameEnd', async (...args)=>{
      packetQueue.push(
        async ()=>{
          if(game) {
            attempt(async ()=>{
              let updates = await game!.$endGame({args, local:true});
              // Object.assign(game!, updates);
              await game!.$syncRemote(); //REMOTE UPDATE CHECKPOINT
  
              await database.rawGame.create({
                data: {
                  upload_reason: 'GameEnd',
                  data: logInput.readLog(),
                  game_id: game!.id
                }
              })
  
              sendServerEvent('GameUpdate', [game]);
            }, game.id, 'GameEnd');
          }
        },
        'GameEnd'
      );
      
    });
  }
}