import { WebSocketServer } from 'ws';
import type { ServerEventPacket, ServerEvents } from './components/ServerEventsProvider';
import { database } from '../prisma/database';
import { GlobalChatMessage, PlayerSlot } from './types/game';
import { Game, Proposal } from '@prisma/client';
import { getCurrentMissionNumber, getCurrentNumProposals, getLatestProposal } from './utils/functions/game';
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

  
  // game = {
  //   id: '123',
  //   game_found:{...game_found, log_time, created_at:new Date()},
  //   chat: [],
  //   missions: {1:null, 2:null,3:null,4:null,5:null},
  //   game_start: null,
  //   game_end: null,
  //   game_players: {0:null,1:null, 2:null,3:null,4:null,5:null,6:null,7:null},
  //   player_ids: [],
  //   created_at: new Date(),
  //   updated_at: new Date(),
  // }
  sendServerEvent('GameUpdate', game);
});
LogReader.on('SpawnPlayer', async (spawn_player, log_time)=>{
  if(game){
    game = await game.$spawnPlayer(spawn_player, log_time);
    // game.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() } //TODO, database approach
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('GameStart', async (game_start, log_time)=>{
  if(game){
    game = await game.$startGame(game_start, log_time);
    // game.game_start = {...game_start, log_time, created_at:new Date()}
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('ChatMessageReceive', async (chat_message, log_time)=>{
  if(game){
    game = await game.$addChatMessage(chat_message, log_time);
    // game.chat.push( {...chat_message, index:game.chat.length, log_time, created_at:new Date() } )
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('SelectPhaseStart', async (select_phase_start, log_time)=>{
  if(game){
    // let propNumber = getCurrentNumProposals(game.game_players, select_phase_start.Mission) + 1;
    // let proposal:Proposal = {
    //   select_phase_start: {...select_phase_start, log_time, chatIndex:game.chat.length, propNumber, created_at: new Date()},
    //   select_updates: [],
    //   select_phase_end:null,
    //   votes: { 0:null, 1: null, 2:null, 3:null, 4:null, 5:null, 6:null, 7:null },
    //   vote_phase_end: null,
    //   vote_phase_start: null,
    //   created_at: new Date()
    // }
    game = await game.$startProposal(select_phase_start, log_time);
    // game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal);
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('SelectUpdate', async (select_update, log_time)=>{
  if(game){
    // let missionNum = getCurrentMissionNumber(game.missions);
    // let latestProposal = getLatestProposal(game.game_players, missionNum);
    // if(!latestProposal)
    //   throw Error("Something went wrong. Could not find the latest proposal..");
    game = await game.$updateProposalSelection(select_update, log_time);
    // latestProposal.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('SelectPhaseEnd', async (select_phase_end, log_time)=>{
  if(game){
    // let missionNum = getCurrentMissionNumber(game.missions);
    // let missionProps:Proposal[]|undefined = game.game_players[select_phase_end.Proposer]?.proposals[missionNum];
    // if(missionProps){
    game = await game.$endProposal(select_phase_end, log_time);
      // missionProps[missionProps.length-1].select_phase_end = {...select_phase_end, log_time, deltaT, chatIndex, created_at: new Date()}
    // }
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('VotePhaseStart', async (vote_phase_start, log_time)=>{
  if(game){
    // let missionNum = getCurrentMissionNumber(game.missions);
    // let proposal = getLatestProposal(game?.game_players, missionNum);
    // if(!proposal)
    //   throw Error("Something went wrong. Could not find the latest proposal..");
    game = await game.$startVote(vote_phase_start, log_time);
    // proposal.vote_phase_start = {...vote_phase_start, chatIndex:game.chat.length, log_time, created_at: new Date()}
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('VoteMade', async (vote_made, log_time)=>{
  if(game){
    // let missionNum = getCurrentMissionNumber(game.missions);
    // let latestProposal = getLatestProposal(game.game_players, missionNum);
    // if(!latestProposal)
    //   throw Error("Something went wrong. Could not find the latest proposal..");
    // if(!latestProposal.vote_phase_start)
    //   throw Error("Something went wrong. Could not find vote_phase_start for latest proposal..");
    // let deltaT = log_time.valueOf() - latestProposal.vote_phase_start.log_time.valueOf();
    game = await game.$addVoteMade(vote_made, log_time);
    // latestProposal.votes[vote_made.Slot] = { ...vote_made, chatIndex:game.chat.length, log_time, deltaT, created_at: new Date() };
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('VotePhaseEnd', async (vote_phase_end, log_time)=>{
  if(game){
    // let missionNum = getCurrentMissionNumber(game.missions);
    // let proposal = getLatestProposal(game?.game_players, missionNum);
    // if(!proposal)
    //   throw Error("Something went wrong. Could not find the latest proposal..");
    // let deltaT = log_time.valueOf() - proposal.select_phase_start.log_time.valueOf();
    game = await game.$endVote(vote_phase_end, log_time);
    // proposal.vote_phase_end = { ...vote_phase_end, chatIndex:game.chat.length, log_time, deltaT, created_at:new Date() };
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('MissionPhaseStart', async (mission_phase_start, log_time)=>{
  if(game){
    // game.missions[mission_phase_start.Mission] = {
    //   mission_phase_start: {...mission_phase_start, log_time, created_at: new Date()},
    //   mission_phase_end: null
    // }
    game = await game.$startMission(mission_phase_start, log_time);
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('MissionPhaseEnd', async (mission_phase_end, log_time)=>{
  if(game) {
    // if(!game.missions[mission_phase_end.Mission])
    //   throw Error(`Something went wrong. Missing mission ${mission_phase_end.Mission}`);
    // let deltaT = log_time.valueOf() - game.missions[mission_phase_end.Mission]!.mission_phase_start.log_time.valueOf();
    // let propNumber = getCurrentNumProposals(game.game_players, mission_phase_end.Mission);
    game = await game.$endMission(mission_phase_end, log_time);
    // game.missions[mission_phase_end.Mission]!.mission_phase_end = { ...mission_phase_end, chatIndex: game.chat.length, log_time, deltaT, propNumber, created_at: new Date()  }
    sendServerEvent('GameUpdate', game);
  }
});
LogReader.on('GameEnd', (game_end, log_time)=>{
  if(game) {
    // game.game_end = { ...game_end, log_time, created_at:new Date() };
    game.$endGame(game_end, log_time);
    sendServerEvent('GameUpdate', game);
  }
});

// //INIT
let client = await getClient();
if(client.mindnight_session)
  await database.mindnightSession.delete({where:{id:client.mindnight_session?.id}})
}
}

