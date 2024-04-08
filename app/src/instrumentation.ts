import { WebSocketServer } from 'ws';
import type { ServerEventPacket, ServerEvents } from './components/ServerEventsProvider';
import { database } from '../prisma/database';
import { GlobalChatMessage, PlayerSlot } from './types/game';
import { Game, Proposal } from '@prisma/client';
import { getCurrentMissionNumber, getCurrentNumProposals, getLatestProposal } from './utils/functions/game';
import { attempt } from './utils/functions/general';
// import { getGame } from './actions/game'; //DO NOT IMPORT FROM HERE OR ANY ANNOTATED COMPONENT

console.log('instrumentation.ts');

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
  const { default:LogReader} = await import('./utils/classes/LogReader');

  if(!process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
    throw Error("Must provide env NEXT_PUBLIC_SERVEREVENTS_WS");
  let wsUrl = new URL(process.env.NEXT_PUBLIC_SERVEREVENTS_WS)
  let clientsWss = new WebSocketServer({
    // host: wsUrl.hostname,
    port: parseInt(wsUrl.port),
  });

  let game:Awaited<ReturnType<typeof database.game.create>>|undefined;
  
  //INIT for clients;
  clientsWss.on('connection', async ()=>{
    let mindnightSession = await getMindnightSession();
    if(mindnightSession)
      sendServerEvent('MindnightSessionUpdate', mindnightSession);
    // game = await database.game.findById('66144a8f577750ccbfab6f00');
    if(game)
      sendServerEvent('GameUpdate', game);
  });

  const sendServerEvent = <T extends keyof ServerEvents>(eventName:T, payload:ServerEvents[T][0] )=>{
    clientsWss?.clients.forEach(client=>{
      let packet:ServerEventPacket = {
        type: eventName,
        payload: payload
      }
      client.send(JSON.stringify(packet));
    });
  }
  
  LogReader.on('ReceiveGlobalChatMessage', async (packet)=>{
    await createGlobalChatMessage(packet.Message);
    sendServerEvent('ReceiveGlobalChatMessage', packet);
  });

LogReader.on('PlayerInfo', async ( packet )=>{
  let mindnightSession = await createMindnightSession(packet);
  // revalidateTag(Tags.session.toString());
  sendServerEvent('MindnightSessionUpdate', mindnightSession);
  sendServerEvent('PlayerInfo', packet);
});

  LogReader.on('AuthorizationRequest', async (packet)=>{
    await sendToMindnight(packet);
    sendServerEvent('AuthorizationRequest', packet);
  });

LogReader.on('AuthResponse', async (packet)=>{
  let mindnightSession = await getMindnightSession();
  if(mindnightSession){
    let authedMindnightSession = await database.mindnightSession.authenticate(mindnightSession);
    console.log('Authenticated MNSession', mindnightSession);
    // revalidateTag(Tags.session);
    sendServerEvent('MindnightSessionUpdate', authedMindnightSession);
  }
  sendServerEvent('AuthResponse', packet);
});


LogReader.on('GlobalChatHistoryResponse', async (packet)=>{
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
});

//building the game
LogReader.on('GameFound', async (game_found, log_time)=>{
  if(game){
    game = undefined;
    // game.game_found = {...game_found, created_at:new Date()}
    // sendServerEvent('GameUpdate', game);
  }
  game = await database.game.create({data:{
    game_found: {...game_found, log_time},
    game_players:{},
    missions:{},
  }});

  sendServerEvent('GameUpdate', game);
});
LogReader.on('SpawnPlayer', async (spawn_player, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$spawnPlayer(spawn_player, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('GameStart', async (game_start, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$startGame(game_start, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('ChatMessageReceive', async (chat_message, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$addChatMessage(chat_message, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('SelectPhaseStart', async (select_phase_start, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$startProposal(select_phase_start, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('SelectUpdate', async (select_update, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$updateProposalSelection(select_update, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('SelectPhaseEnd', async (select_phase_end, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$endProposal(select_phase_end, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('VotePhaseStart', async (vote_phase_start, log_time)=>{                                                                                                                                   
  if(game){
    attempt(async ()=>{
      game = await game!.$startVote(vote_phase_start, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('VoteMade', async (vote_made, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$addVoteMade(vote_made, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('VotePhaseEnd', async (vote_phase_end, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$endVote(vote_phase_end, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('MissionPhaseStart', async (mission_phase_start, log_time)=>{
  if(game){
    attempt(async ()=>{
      game = await game!.$startMission(mission_phase_start, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('MissionPhaseEnd', async (mission_phase_end, log_time)=>{
  if(game) {
    attempt(async ()=>{
      game = await game!.$endMission(mission_phase_end, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});
LogReader.on('GameEnd', async (game_end, log_time)=>{
  if(game) {
    attempt(async ()=>{
      database.rawGame.create({
        data: {
          upload_reason: 'GameEnd',
          data: LogReader.readLog(),
          game_id: game!.id
        }
      })

      game = await game!.$endGame(game_end, log_time);
      sendServerEvent('GameUpdate', game);
    }, game.id);
  }
});

// //INIT
let client = await getClient();
if(client.mindnight_session)
  await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
}
}

