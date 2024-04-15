import "dotenv/config";
import { LogReader } from "@/utils/classes/LogEvents/LogReader";
import { database } from "@/database";
import { Game, Proposal } from "@prisma/client";
import { getCurrentMissionNumber, getCurrentNumProposals, getLatestProposal } from "@/utils/functions/game";
import ProcessQueue from "@/utils/classes/ProcessQueue";
import fs from 'fs';
import path from "path";
import { waitUntil } from "@/utils/functions/general";
import { moveDirectorySync } from "@/utils/functions/fs";

const basepath = './__transfer__/data';
// let games_to_transfer = fs.readdirSync(basepath);
let games_to_transfer = fs.readdirSync(basepath);
for( let legacy_gameid of games_to_transfer){
  // let logpath = path.join(basepath, legacy_gameid, 'Player.log');
  let dirpath =  path.join(basepath, legacy_gameid)
  let logpath = path.join(dirpath, 'Player.log');
  await processGame(logpath);
  let new_dirpath = path.join(basepath, '..', 'complete', legacy_gameid);
  moveDirectorySync(dirpath, new_dirpath);
};

function processGame(logpath: string) {
  return new Promise<void>(async (resolve, reject)=>{
    const packetQueue = new ProcessQueue({autostart:true });
    
    let logReader = new LogReader({
      logpath: logpath, 
      timeBetweenLinesMS:1, 
      startAtLineContaining:'Received GameFound', 
      onComplete:(lines)=>waitUntil(()=>packetQueue.numJobs===0, 120_000).then(()=>resolve())
    });

    let game:Game|undefined;

    logReader.on('GameFound', async (game_found, log_time)=>{
      // console.log('GAMEFOUND');
      packetQueue.push(
        async()=>{
          console.log('GameFound Execute');
          game = await database.game.create({data:{
            game_found: {...game_found, log_time},
            game_players:{},
            missions:{},
            source: 'upload',
            latest_log_time: log_time
          }});
          console.log('New Game', game?.id);
          await database.rawGame.create({data:{
            data: logReader.readLog(),
            upload_reason:'Upload',
            context:'transfer',
            game_id: game.id
          }})
        }, 
        'GameFound'
      );
    });

    logReader.on('SpawnPlayer', async (spawn_player, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('SpawnPlayer Execute');
            game.game_players = {
              ...game.game_players,
              // "0": {...spawn_player, proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, chat_updates:[], connection_updates:[], idle_status_updates:[], log_time, created_at:new Date(), } //UNCOMMENT FOR TYPE CHECKING
              [spawn_player.Slot]: {...spawn_player, proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, chat_updates:[], connection_updates:[], idle_status_updates:[], log_time, created_at:new Date(), }
            }
            game.latest_log_time = log_time;
          }
        }, 
        'SpawnPlayer'
      );
    });

    logReader.on('GameStart', async (game_start, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            game.game_start = { ...game_start, log_time, created_at: new Date() }
            game.latest_log_time = log_time;
          }
        }, 
        'GameStart'
      );
    });

    logReader.on('ChatMessageReceive', async (chat_message_receive, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('ChatMessageReceive');
            game.chat.push({...chat_message_receive, index:game.chat.length, log_time, created_at: new Date()})
            game.latest_log_time = log_time;
          }
        }, 
        'ChatMessageReceive'
      );
    });
    logReader.on('ChatUpdate', async (chat_update, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            let game_player = game.game_players[chat_update.Slot];
            if(!game_player)
              throw Error("Something went wrong, no game_player found for chat_update")
            game_player.chat_updates.push({ ...chat_update, log_time, created_at:new Date() })
            game.latest_log_time = log_time;
          }
        }, 
        'ChatUpdate'
      );
    });

    logReader.on('IdleStatusUpdate', async (idle_status_update, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('IdleStatusUpdate');
            let game_player = game.game_players[idle_status_update.Player];
            if(!game_player)
              throw Error("Something went wrong, no game_player found for chat_update")
            game_player.idle_status_updates.push({ ...idle_status_update, chatIndex:game.chat.length, log_time, created_at:new Date() })
            game.latest_log_time = log_time;
          }
        },
        'IdleStatusUpdate'
      );
    });
    logReader.on('Disconnected', async (disconnected, log_time)=>{
      packetQueue.push(
          async()=>{
          if(game){
            console.log('Disconnected');
            let game_player = game.game_players[disconnected.Player];
            if(!game_player)
              throw Error("Something went wrong, no game_player found for chat_update")
            game_player.connection_updates.push({ ...disconnected, chatIndex:game.chat.length, log_time, created_at:new Date() })
            game.latest_log_time = log_time;
          }
        },
        'Disconnected'
      );
    });
    logReader.on('Reconnected', async (reconnected, log_time)=>{
      packetQueue.push(
          async()=>{
          if(game){
            console.log('Reconnected');
            let game_player = game.game_players[reconnected.Player];
            if(!game_player)
              throw Error("Something went wrong, no game_player found for chat_update")
            game_player.connection_updates.push({ ...reconnected, ByNetwork:null, chatIndex:game.chat.length, log_time, created_at:new Date() })
            game.latest_log_time = log_time;
          }
        },
        'Reconnected'
      );
    });

    logReader.on('SelectPhaseStart', async (select_phase_start, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('SelectPhaseStart');
            let propNumber = getCurrentNumProposals(game.game_players, select_phase_start.Mission) + 1;
            let proposal:Proposal = {
              select_phase_start: {...select_phase_start, chatIndex: game.chat.length, log_time, propNumber, created_at:new Date()},
              select_updates: [],
              select_phase_end: null,
              vote_phase_start: null,
              vote_mades: { 0:null, 1:null, 2:null, 3:null, 4:null, 5:null, 6:null, 7:null },
              vote_phase_end: null,
              created_at: new Date()
            }
            game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal); //= {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            game.latest_log_time = log_time;
          }
        },
        'SelectPhaseStart'
      );
    });

    logReader.on('SelectUpdate', async (select_update, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('SelectUpdate');
            let missionNum = getCurrentMissionNumber(game.missions);
            let latestProposal = getLatestProposal(game.game_players, missionNum);
            if(!latestProposal)
              throw Error("Something went wrong. Could not find the latest proposal..");
            latestProposal.value.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
            game.latest_log_time = log_time;
          }
        },
        'SelectUpdate'
      );
    });

    logReader.on('SelectPhaseEnd', async (select_phase_end, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('SelectPhaseEnd');
            let game_player = game.game_players[select_phase_end.Proposer];
            if(!game_player)
              throw Error("Somethign went wrong, game_player was not found.");
            let missionNum = getCurrentMissionNumber(game.missions);
            let proposals = game_player.proposals[missionNum];
            let latestProposal = proposals[proposals.length-1];
            let deltaT = log_time.valueOf() - latestProposal.select_phase_start.log_time.valueOf();
            if(!latestProposal)
              throw Error("Something went wrong. Could not find the latest proposal..");
            latestProposal.select_phase_end = { ...select_phase_end, chatIndex: game.chat.length, log_time, deltaT, created_at: new Date() }
            game.latest_log_time = log_time;
          }
        },
        'SelectPhaseEnd'
      );
    });

    logReader.on('VotePhaseStart', async (vote_phase_start, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('VotePhaseStart');
            let game_player = game.game_players[vote_phase_start.Proposer];
            if(!game_player)
              throw Error("Somethign went wrong, game_player was not found.");
            let missionNum = getCurrentMissionNumber(game.missions);
            let latestProposal = game_player.proposals[missionNum][ game_player.proposals[missionNum].length-1 ];
            latestProposal.vote_phase_start = { ...vote_phase_start, chatIndex:game.chat.length, log_time, created_at:new Date() }
            game.latest_log_time = log_time;
          }
        },
        'VotePhaseStart'
      );
    });

    logReader.on('VoteMade', async (vote_made, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('VoteMade');
            let missionNum = getCurrentMissionNumber(game.missions);
            let latestProposal = getLatestProposal(game.game_players, missionNum);
            if(!latestProposal)
              throw Error("Something went wrong. Could not find the latest proposal..");
            if(!latestProposal.value.vote_phase_start)
              throw Error("Somethign went wrong, no vote_phase_start.");
            let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
            latestProposal.value.vote_mades[vote_made.Slot] = { ...vote_made, chatIndex:game.chat.length, log_time, deltaT, created_at: new Date() };
            game.latest_log_time = log_time;
          }
        },
        'VoteMade'
      );
    });

    logReader.on('VotePhaseEnd', async (vote_phase_end, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('VotePhaseEnd');
            let missionNum = getCurrentMissionNumber(game.missions);
            let latestProposal = getLatestProposal(game.game_players, missionNum);
            if(!latestProposal)
              throw Error("Something went wrong, latestProposal not found.");
            let game_player = game.game_players[latestProposal.playerSlot];
            if(!game_player)
              throw Error("Somethign went wrong, game_player was not found.");
            if(!latestProposal.value.vote_phase_start)
              throw Error("Something went wrong, no vote_phase_start for latest proposal.");
            let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
            latestProposal.value.vote_phase_end = { ...vote_phase_end, chatIndex: game.chat.length, log_time, deltaT, created_at: new Date() }
            game.latest_log_time = log_time;
          }
        },
        'VotePhaseEnd'
      );
    });

    logReader.on('MissionPhaseStart', async (mission_phase_start, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('MissionPhaseStart');
            game.missions[mission_phase_start.Mission] = { 
              mission_phase_start: { ...mission_phase_start, log_time, chatIndex: game.chat.length, created_at: new Date() },
              mission_phase_end: null
            }
            game.latest_log_time = log_time;
          }
        },
        'MissionPhaseStart'
      );
    });

    logReader.on('MissionPhaseEnd', async (mission_phase_end, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('MissionPhaseEnd');
            let mission = game.missions[mission_phase_end.Mission];
            if(!mission)
              throw Error("Something went wrong, no mission found.");
            let propNumber = getCurrentNumProposals(game.game_players, mission_phase_end.Mission);
            let deltaT = log_time.valueOf() - mission.mission_phase_start.log_time.valueOf()
            mission.mission_phase_end = { ...mission_phase_end, log_time, chatIndex:game.chat.length, deltaT, propNumber, created_at:new Date() }
            game.latest_log_time = log_time;
          }
        },
        'MissionPhaseEnd'
      );
    });

    logReader.on('GameEnd', async (game_end, log_time)=>{
      console.log('#######################');
      console.log('GAME END', game?.id);
      console.log('#######################');
      packetQueue.push(
        async()=>{
          if(game){
            console.log('#######################');
            console.log('GAME END START', game?.id);
            console.log('#######################');
            if(!game.game_start)
              throw Error("Something went wrong, game_start not found");
            let deltaT = log_time.valueOf() - game.game_start.log_time.valueOf();
            let playerIds = await Promise.all(game_end.PlayerIdentities.map(async playerIdentity=>{
              let player = await database.player.findOrCreate({data:{
                name:playerIdentity.Nickname,
                steam_id: playerIdentity.Steamid,
                level: playerIdentity.Level,
              }}, {where:{steam_id:playerIdentity.Steamid}});
              return player.id
            }));

            game.player_ids = playerIds;
            game.game_end = { ...game_end, log_time, deltaT, chatIndex: game.chat.length, created_at: new Date() }
            game.latest_log_time = log_time;

            let prepForUpload = { ...database.game.polish(game), id:undefined };
            await database.game.update({where:{id:game.id}, data:prepForUpload });
            console.log('#######################');
            console.log('GAME UPLOADED', game.id);
            console.log(game);
            console.log('#######################');
          }
        },
        'GameEnd'
      );
    });

    logReader.on('GlobalChatHistoryRequest', async (game_end, log_time)=>{
      packetQueue.push(
        async()=>{
          if(game?.game_end){
            await database.game.update({where:{id:game.id}, data:{ //on hitting main menu, upload latest chat to capture any after game chat
              chat:game.chat,
              game_players:game.game_players,
              latest_log_time: log_time
            }});
          }
        },
        'GlobalChatHistoryRequest'
      );
    });
    logReader.on('GameClose', async (log_time)=>{
      packetQueue.push(
        async()=>{
          if(game?.game_end){
            await database.game.update({where:{id:game.id}, data:{ //on closing game, upload latest chat to capture any after game chat
              chat:game.chat,
              game_players:game.game_players,
              latest_log_time: log_time
            }});
          }
        },
        'GameClose'
      );
    });
  });
}
