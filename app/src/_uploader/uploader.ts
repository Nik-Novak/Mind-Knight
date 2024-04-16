import "dotenv/config";
import { LogReader } from "@/utils/classes/LogEvents/LogReader";
import { database } from "@/database";
import ProcessQueue from "@/utils/classes/ProcessQueue";
import fs from 'fs';
import path from "path";
import { waitUntil } from "@/utils/functions/general";
import { moveDirectorySync } from "@/utils/functions/fs";

console.log("TEST");
// throw Error("STOP");

const basepath = './__transfer__/data';
// let games_to_transfer = fs.readdirSync(basepath);
let games_to_transfer = fs.readdirSync(basepath);

// games_to_transfer = [games_to_transfer.find(g=>g=='coin_gods')!];  //TEST ONE GAME

for( let legacy_gameid of games_to_transfer){
  // let logpath = path.join(basepath, legacy_gameid, 'Player.log');
  let dirpath =  path.join(basepath, legacy_gameid)
  let logpath = path.join(dirpath, 'Player.log');
  try{
    console.log('PROCESSING:', logpath);
    await processGame(logpath, legacy_gameid);
    let new_dirpath = path.join(basepath, '..', 'complete', legacy_gameid);
    moveDirectorySync(dirpath, new_dirpath);
  }catch(err){
    if(err instanceof Error){
      console.log(`ERROR ON ${legacy_gameid}`);
      console.log(`ERROR: `, err);
      let new_dirpath = path.join(basepath, '..', err.message.includes('PARTIAL') ? 'partial':'error', legacy_gameid);
      moveDirectorySync(dirpath, new_dirpath);
      let errorPath = path.join(new_dirpath, 'error.log');
      fs.writeFileSync(errorPath, JSON.stringify({name:err.name, cause: err.cause, message: err.message, stack: err.stack}, null, 2), {encoding:'utf8'});
      console.log(`Wrote error to ${errorPath}`);
    }
  }
};

function processGame(logpath: string, legacy_gameid?:string) {
  return new Promise<void>(async (resolve, reject)=>{
    const packetQueue = new ProcessQueue({autostart:true });
    
    let logReader = new LogReader({
      logpath: logpath, 
      timeBetweenLinesMS:1, 
      startAtLineContaining:'Received GameFound', 
      onComplete:(lines)=>waitUntil(()=>packetQueue.numJobs===0, 120_000).then(()=>resolve())
    });

    let game:Awaited<ReturnType<typeof database.game.create>>|undefined;

    logReader.on('GameFound', async (game_found, log_time)=>{
      // console.log('GAMEFOUND');
      packetQueue.push(
        async()=>{
          console.log('GameFound Execute');
          game = await database.game.create({data:{
            game_found: {...game_found, log_time},
            game_players:{},
            missions:{},
            source: 'Transfer',
            latest_log_time: log_time,
            context: legacy_gameid
          }});
          console.log('New Game', game?.id);
          await database.rawGame.create({data:{
            data: logReader.readLog(),
            upload_reason:'Transfer',
            context:'transfer',
            game_id: game.id
          }})
        }, 
        'GameFound'
      );
    });

    logReader.on('SpawnPlayer', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('SpawnPlayer Execute');
            await game.$spawnPlayer({args, local:true});
            // game.game_players = {
            //   ...game.game_players,
            //   // "0": {...spawn_player, proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, chat_updates:[], connection_updates:[], idle_status_updates:[], log_time, created_at:new Date(), } //UNCOMMENT FOR TYPE CHECKING
            //   [spawn_player.Slot]: {...spawn_player, proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, chat_updates:[], connection_updates:[], idle_status_updates:[], log_time, created_at:new Date(), }
            // }
            // game.latest_log_time = log_time;
          }
        }, 
        'SpawnPlayer'
      );
    });

    logReader.on('GameStart', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$startGame({args, local:true});
            // game.game_start = { ...game_start, log_time, created_at: new Date() }
            // game.latest_log_time = log_time;
          }
        }, 
        'GameStart'
      );
    });

    logReader.on('ChatMessageReceive', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$addChatMessage({args, local:true});
            // console.log('ChatMessageReceive');
            // game.chat.push({...chat_message_receive, index:game.chat.length, log_time, created_at: new Date()})
            // game.latest_log_time = log_time;
          }
        }, 
        'ChatMessageReceive'
      );
    });
    logReader.on('ChatUpdate', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$addChatUpdate({args, local:true});
            // let game_player = game.game_players[chat_update.Slot];
            // if(!game_player)
            //   throw Error("Something went wrong, no game_player found for chat_update")
            // game_player.chat_updates.push({ ...chat_update, log_time, created_at:new Date() })
            // game.latest_log_time = log_time;
          }
        }, 
        'ChatUpdate'
      );
    });

    logReader.on('IdleStatusUpdate', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$addIdleStatusUpdate({args, local:true});
            // console.log('IdleStatusUpdate');
            // let game_player = game.game_players[idle_status_update.Player];
            // if(!game_player)
            //   throw Error("Something went wrong, no game_player found for chat_update")
            // game_player.idle_status_updates.push({ ...idle_status_update, chatIndex:game.chat.length, log_time, created_at:new Date() })
            // game.latest_log_time = log_time;
          }
        },
        'IdleStatusUpdate'
      );
    });
    logReader.on('Disconnected', async (...args)=>{
      packetQueue.push(
          async()=>{
          if(game){
            await game.$addConnectionUpdate({args, local:true});
            // console.log('Disconnected');
            // let game_player = game.game_players[disconnected.Player];
            // if(!game_player)
            //   throw Error("Something went wrong, no game_player found for chat_update")
            // game_player.connection_updates.push({ ...disconnected, chatIndex:game.chat.length, log_time, created_at:new Date() })
            // game.latest_log_time = log_time;
          }
        },
        'Disconnected'
      );
    });
    
    logReader.on('Reconnected', async (...args)=>{
      packetQueue.push(
          async()=>{
          if(game){
            await game.$addConnectionUpdate({args, local:true});
            // console.log('Reconnected');
            // let game_player = game.game_players[reconnected.Player];
            // if(!game_player)
            //   throw Error("Something went wrong, no game_player found for chat_update")
            // game_player.connection_updates.push({ ...reconnected, ByNetwork:null, chatIndex:game.chat.length, log_time, created_at:new Date() })
            // game.latest_log_time = log_time;
          }
        },
        'Reconnected'
      );
    });

    logReader.on('SelectPhaseStart', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$startProposal({args, local:true});
            // console.log('SelectPhaseStart');
            // let propNumber = getCurrentNumProposals(game.game_players, select_phase_start.Mission) + 1;
            // let proposal:Proposal = {
            //   select_phase_start: {...select_phase_start, chatIndex: game.chat.length, log_time, propNumber, created_at:new Date()},
            //   select_updates: [],
            //   select_phase_end: null,
            //   vote_phase_start: null,
            //   vote_mades: { 0:null, 1:null, 2:null, 3:null, 4:null, 5:null, 6:null, 7:null },
            //   vote_phase_end: null,
            //   created_at: new Date()
            // }
            // game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal); //= {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            // game.latest_log_time = log_time;
          }
        },
        'SelectPhaseStart'
      );
    });

    logReader.on('SelectUpdate', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            try{
              await game.$updateProposalSelection({args, local:true});
            }
            catch(err){
              console.log('Upload halted on ID:', legacy_gameid);
              console.error(err);
              reject(err);
              throw err;
            }
          
            // console.log('SelectUpdate');
            // let missionNum = getCurrentMissionNumber(game.missions);
            // let latestProposal = getLatestProposal(game.game_players, missionNum);
            // if(!latestProposal)
            //   throw Error("Something went wrong. Could not find the latest proposal..");
            // latestProposal.value.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
            // game.latest_log_time = log_time;
          }
        },
        'SelectUpdate'
      );
    });

    logReader.on('SelectPhaseEnd', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            try{
              await game.$endProposal({args, local:true});
            }
            catch(err){
              console.log('Upload halted on ID:', legacy_gameid);
              console.error(err);
              reject(err);
              throw err;
            }
            // console.log('SelectPhaseEnd');
            // let game_player = game.game_players[select_phase_end.Proposer];
            // if(!game_player)
            //   throw Error("Somethign went wrong, game_player was not found.");
            // let missionNum = getCurrentMissionNumber(game.missions);
            // let proposals = game_player.proposals[missionNum];
            // let latestProposal = proposals[proposals.length-1];
            // let deltaT = log_time.valueOf() - latestProposal.select_phase_start.log_time.valueOf();
            // if(!latestProposal)
            //   throw Error("Something went wrong. Could not find the latest proposal..");
            // latestProposal.select_phase_end = { ...select_phase_end, chatIndex: game.chat.length, log_time, deltaT, created_at: new Date() }
            // game.latest_log_time = log_time;
          }
        },
        'SelectPhaseEnd'
      );
    });

    logReader.on('VotePhaseStart', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$startVote({args, local:true});
            // console.log('VotePhaseStart');
            // let game_player = game.game_players[vote_phase_start.Proposer];
            // if(!game_player)
            //   throw Error("Somethign went wrong, game_player was not found.");
            // let missionNum = getCurrentMissionNumber(game.missions);
            // let latestProposal = game_player.proposals[missionNum][ game_player.proposals[missionNum].length-1 ];
            // latestProposal.vote_phase_start = { ...vote_phase_start, chatIndex:game.chat.length, log_time, created_at:new Date() }
            // game.latest_log_time = log_time;
          }
        },
        'VotePhaseStart'
      );
    });

    logReader.on('VoteMade', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            try{
              await game.$addVoteMade({args, local:true});
            }
            catch(err){
              console.log('Upload halted on ID:', legacy_gameid);
              console.error(err);
              reject(err);
              throw err;
            }
            // console.log('VoteMade');
            // let missionNum = getCurrentMissionNumber(game.missions);
            // let latestProposal = getLatestProposal(game.game_players, missionNum);
            // if(!latestProposal)
            //   throw Error("Something went wrong. Could not find the latest proposal..");
            // if(!latestProposal.value.vote_phase_start)
            //   throw Error("Somethign went wrong, no vote_phase_start.");
            // let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
            // latestProposal.value.vote_mades[vote_made.Slot] = { ...vote_made, chatIndex:game.chat.length, log_time, deltaT, created_at: new Date() };
            // game.latest_log_time = log_time;
          }
        },
        'VoteMade'
      );
    });

    logReader.on('VotePhaseEnd', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            try{
              await game.$endVote({args, local:true});
            }
            catch(err){
              console.log('Upload halted on ID:', legacy_gameid);
              console.error(err);
              reject(err);
              throw err;
            }
          }
        },
        'VotePhaseEnd'
      );
    });

    logReader.on('MissionPhaseStart', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$startMission({args, local:true});
          }
        },
        'MissionPhaseStart'
      );
    });

    logReader.on('MissionPhaseEnd', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            await game.$endMission({args, local:true});
          }
        },
        'MissionPhaseEnd'
      );
    });

    logReader.on('GameEnd', async (...args)=>{
      packetQueue.push(
        async()=>{
          if(game){
            console.log('#######################');
            console.log('GAME END', game?.id);
            console.log('#######################');
            await game.$endGame({args, local:true});
            await game.$syncLocal();
            console.log('#######################');
            console.log('GAME UPLOADED', game.id);
            console.log('#######################');
          }
        },
        'GameEnd'
      );
    });

    logReader.on('GlobalChatHistoryRequest', async (global_chat_history, log_time)=>{
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

    // logReader.on('MatchUpdatePacket', async (match_update_packet, log_time)=>{
    //   packetQueue.push(
    //     async()=>{
    //       console.log('MATCH UPDATE PACKET', match_update_packet);
    //     },
    //     'MatchUpdatePacket'
    //   );
    // });

  //   logReader.on('MatchUpdatePacket', async(match_update_packet, log_time)=>{
  //     packetQueue.push(
  //       async ()=>{
  //         let message = "THIS IS A PARTIAL/RECONNECTED MATCH, try to find the matching disconnect.";
  //         reject(message);
  //         throw Error(message);
  //       },
  //       'MatchUpdatePacket'
  //     );
  //   });

  });
}
