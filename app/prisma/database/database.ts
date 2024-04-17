import { LogEvents } from '@/types/events';
import { getCurrentMissionNumber, getCurrentNumProposals, getLatestProposal } from '@/utils/functions/game';
import { PrismaClient, PlayerIdentity, Prisma, Game, Client, MindnightSession, MindnightSessionStatus, Proposal,  } from '@prisma/client'
// let modelnames = Prisma.dmmf.datamodel.models.map(m=>m.name); Value `in` modelnames

type NonNull<T> = Exclude<T, null | undefined>;

// type DataType<M extends keyof typeof prisma> = Prisma.Args<(typeof prisma)[M], 'create'>['data']

type ObjectWithArrays<T> = {
  [K in keyof T]: T[K] extends any[] ? { equals: T[K][number] } | T[K] : T[K];
};
function replaceArraysWithEquals<T>(obj: T): ObjectWithArrays<T> {
  const newObj: any = {};
  for (const key in obj) {
      if (Array.isArray(obj[key])) {
          const arr = obj[key] as any[];
          if (arr.length === 1) {
              newObj[key] = { equals: arr };
          } else {
              newObj[key] = arr.map((value: any) => ({ equals: value }));
          }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          newObj[key] = replaceArraysWithEquals(obj[key]);
      } else {
          newObj[key] = obj[key];
      }
  }
  return newObj as ObjectWithArrays<T>;
}

const prismaClientSingleton= ()=>{ 
  
  let prisma = new PrismaClient();
  return prisma.$extends({
    query:{
      $allOperations({ model, operation, args, query }) {
        /* your custom logic for modifying all Prisma Client operations here */
        return query(args)
      }
    },
    result:{
      game:{
        $spawnPlayer: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['SpawnPlayer'], local?:boolean})=>{
              let [spawn_player, log_time] = args;
              if(local){
                game.game_players = {
                  ...game.game_players,
                  // "0": {...spawn_player, proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, chat_updates:[], connection_updates:[], idle_status_updates:[], log_time, created_at:new Date(), } //UNCOMMENT FOR TYPE CHECKING
                  [spawn_player.Slot]: {...spawn_player, proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, chat_updates:[], connection_updates:[], idle_status_updates:[], log_time, created_at:new Date(), }
                }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players: {
                    update:{
                      [spawn_player.Slot]: {...spawn_player,  proposals:{}, log_time }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startGame: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['GameStart'], local?:boolean})=>{
              let [game_start, log_time] = args;
              if(local){
                game.game_start = { ...game_start, log_time, created_at: new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_start: {...game_start, log_time},
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $addChatMessage: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['ChatMessageReceive'], local?:boolean})=>{
              let [chat_message_receive, log_time] = args;
              if(local){
                game.chat.push({...chat_message_receive, index:game.chat.length, log_time, created_at: new Date()})
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  chat: {push:{
                    ...chat_message_receive,
                    index: game.chat.length,
                    log_time
                  }},
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $addChatUpdate: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['ChatUpdate'], local?:boolean})=>{
              let [chat_update, log_time] = args;
              let game_player = game.game_players[chat_update.Slot];
              if(!game_player)
                throw Error("Something went wrong, no game_player found for chat_update")
              // game_player.chat_updates.push({ ...chat_update, log_time, created_at:new Date() })
              // game.latest_log_time = log_time;
              if(local){
                game_player.chat_updates.push({ ...chat_update, log_time, created_at:new Date() })
                game.latest_log_time = log_time;
                return game
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                      update:{
                        [game_player.Slot]:{
                          upsert:{
                            update:{
                              chat_updates: {push: { ...chat_update, log_time }}
                            },
                            set:{
                              ...game_player
                            }
                          },
                        }
                      }
                  },
                  latest_log_time: log_time
                }});
            }
          },
        },
        $addIdleStatusUpdate: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['IdleStatusUpdate'], local?:boolean})=>{
              let [idle_status_update, log_time] = args;
              let game_player = game.game_players[idle_status_update.Player];
              if(!game_player)
                throw Error("Something went wrong, no game_player found for chat_update")
              // game_player.chat_updates.push({ ...chat_update, log_time, created_at:new Date() })
              // game.latest_log_time = log_time;
              if(local){
                game_player.idle_status_updates.push({ ...idle_status_update, chatIndex:game.chat.length, log_time, created_at:new Date() })
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                      update:{
                        ["0"]:{
                          upsert:{
                            update:{
                              idle_status_updates: {push: { ...idle_status_update, chatIndex:game.chat.length, log_time }}
                            },
                            set:{
                              ...game_player
                            }
                          },
                        }
                      }
                  },
                  latest_log_time: log_time
                }});
            }
          },
        },
        $addConnectionUpdate: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['Reconnected']|LogEvents['Disconnected'], local?:boolean})=>{
              let [connection_update, log_time] = args;
              let game_player = game.game_players[connection_update.Player];
              if(!game_player)
                throw Error("Something went wrong, no game_player found for chat_update")
              if(local){
                game_player.connection_updates.push({ ByNetwork:null, ...connection_update, chatIndex:game.chat.length, log_time, created_at:new Date() })
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                      update:{
                        ["0"]:{
                          upsert:{
                            update:{
                              connection_updates: {push: { ...connection_update, chatIndex:game.chat.length, log_time }}
                            },
                            set:{
                              ...game_player
                            }
                          },
                        }
                      }
                  },
                  latest_log_time: log_time
                }});
            }
          },
        },
        $startProposal: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['SelectPhaseStart'], local?:boolean})=>{
              let [select_phase_start, log_time] = args;
              let propNumber = getCurrentNumProposals(game.game_players, select_phase_start.Mission) + 1; 
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = game.game_players[select_phase_start.Player];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              if(local){
                let proposal:Proposal = {
                  select_phase_start: {...select_phase_start, chatIndex: game.chat.length, log_time, propNumber, created_at:new Date()},
                  select_updates: [],
                  select_phase_end: null,
                  vote_phase_start: null,
                  vote_mades: { 0:null, 1:null, 2:null, 3:null, 4:null, 5:null, 6:null, 7:null },
                  vote_phase_end: null,
                  created_at: new Date()
                }
                console.log('Mission:', select_phase_start.Mission);
                game_player.proposals[select_phase_start.Mission].push(proposal); //= {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                    update:{
                      [game_player.Slot]:{
                        upsert:{
                          update:{
                            proposals:{
                              update:{
                                [select_phase_start.Mission]:{
                                  push: {
                                    select_phase_start: {...select_phase_start, chatIndex: game.chat.length, log_time, propNumber},
                                    vote_mades: {}
                                  }
                                }
                              }
                            }
                          },
                          set:{
                            ...game_player
                          }
                        },
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $updateProposalSelection: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['SelectUpdate'], local?:boolean})=>{
              let [select_update, log_time] = args;
              let missionNum = getCurrentMissionNumber(game.missions);
              console.log('Mission:', missionNum);
              let latestProposal = getLatestProposal(game.game_players, missionNum);
              if(!latestProposal)
                throw Error("Something went wrong. Could not find the latest proposal..");
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = game.game_players[latestProposal.playerSlot];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              // let newProposals = [ ...game_player.proposals[missionNum] ];
              // latestProposal.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
              // newProposals[latestProposal.proposalIndex].select_updates.push({ ...select_update, chatIndex: data.chat.length, log_time })
              if(local){
                latestProposal.value.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                    update:{
                      [game_player.Slot]:{
                        upsert:{
                          update:{
                            proposals:{
                              update:{
                                [missionNum]:{
                                  updateMany:{ //should only update the latest proposal
                                    where:{created_at: latestProposal.value.created_at}, 
                                    data:{ select_updates:{ push: { ...select_update, chatIndex: game.chat.length, log_time }} } 
                                  }
                                }
                              }
                            }
                          },
                          set:{
                            ...game_player,
                          }
                        },
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endProposal: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['SelectPhaseEnd'], local?:boolean})=>{
              let [select_phase_end, log_time] = args;
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = game.game_players[select_phase_end.Proposer];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              let missionNum = getCurrentMissionNumber(game.missions);
              console.log('Mission:', missionNum);
              let proposals = game_player.proposals[missionNum];
              let latestProposal = proposals[proposals.length-1];
              let deltaT = log_time.valueOf() - latestProposal.select_phase_start.log_time.valueOf();
              if(local){
                latestProposal.select_phase_end = { ...select_phase_end, chatIndex: game.chat.length, log_time, deltaT, created_at: new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                    update:{
                      [game_player.Slot]:{
                        upsert:{
                          update:{
                            proposals:{
                              update:{
                                [missionNum]:{
                                  updateMany: {
                                    where: { created_at: latestProposal.created_at },
                                    data: {
                                      select_phase_end:{
                                        ...select_phase_end, chatIndex: game.chat.length, log_time, deltaT
                                      }
                                    }
                                  },
                                }
                              }
                            }
                          },
                          set:{
                            ...game_player,
                          }
                        },
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startVote: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['VotePhaseStart'], local?:boolean})=>{
              let [vote_phase_start, log_time] = args;
              // let propNumber = getCurrentNumProposals(data.game_players, select_phase_start.Mission) + 1; 
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = game.game_players[vote_phase_start.Proposer];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              let missionNum = getCurrentMissionNumber(game.missions);
              console.log('Mission:', missionNum);
              let latestProposal = game_player.proposals[missionNum][ game_player.proposals[missionNum].length-1 ];
              if(local){
                latestProposal.vote_phase_start = { ...vote_phase_start, chatIndex:game.chat.length, log_time, created_at:new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                    update:{
                      [game_player.Slot]:{
                        upsert:{
                          update:{
                            proposals:{
                              update:{
                                [missionNum]:{
                                  updateMany:{
                                    where: { created_at: latestProposal.created_at },
                                    data: { vote_phase_start: { ...vote_phase_start, chatIndex:game.chat.length, log_time } }
                                  }
                                }
                              }
                            }
                          },
                          set:{
                            ...game_player,
                          }
                        },
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $addVoteMade: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['VoteMade'], local?:boolean})=>{
              let [vote_made, log_time] = args;
              let missionNum = getCurrentMissionNumber(game.missions);
              console.log('Mission:', missionNum);
              let latestProposal = getLatestProposal(game.game_players, missionNum);
              if(!latestProposal)
                throw Error("Something went wrong. Could not find the latest proposal..");
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = game.game_players[latestProposal.playerSlot];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              // let newProposals = [ ...game_player.proposals[missionNum] ];
              // latestProposal.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
              // newProposals[latestProposal.proposalIndex].select_updates.push({ ...select_update, chatIndex: data.chat.length, log_time })
              if(!latestProposal.value.vote_phase_start)
                throw Error("Somethign went wrong, no vote_phase_start.")
              let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
              if(local){
                latestProposal.value.vote_mades[vote_made.Slot] = { ...vote_made, chatIndex:game.chat.length, log_time, deltaT, created_at: new Date() };
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                    update:{
                      [game_player.Slot]:{
                        upsert:{
                          update:{
                            proposals:{
                              update:{
                                [missionNum]:{
                                  updateMany:{ //should only update the latest proposal
                                    where:{created_at: latestProposal.value.created_at}, 
                                    data:{ 
                                      vote_mades:{
                                        update: {
                                          [vote_made.Slot]: {
                                            set:{
                                              ...vote_made, chatIndex:game.chat.length, log_time, deltaT
                                            }
                                          }
                                        }
                                      } 
                                    } 
                                  }
                                }
                              }
                            }
                          },
                          set:{
                            ...game_player,
                          }
                        },
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endVote: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['VotePhaseEnd'], local?:boolean})=>{
              let [vote_phase_end, log_time] = args;
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let missionNum = getCurrentMissionNumber(game.missions);
              console.log('Mission:', missionNum);
              let latestProposal = getLatestProposal(game.game_players,missionNum);
              if(!latestProposal)
                throw Error("Something went wrong, latestProposal not found.");
              let game_player = game.game_players[latestProposal.playerSlot];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              if(!latestProposal.value.vote_phase_start)
                throw Error("Something went wrong, no vote_phase_start for latest proposal.");
              let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
              if(local){
                latestProposal.value.vote_phase_end = { ...vote_phase_end, chatIndex: game.chat.length, log_time, deltaT, created_at: new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_players:{
                    update:{
                      [latestProposal.playerSlot]:{
                        upsert:{
                          update:{
                            proposals:{
                              update:{
                                [missionNum]:{
                                  updateMany: {
                                    where: { created_at: latestProposal.value.created_at },
                                    data: {
                                      vote_phase_end:{
                                        ...vote_phase_end, chatIndex: game.chat.length, log_time, deltaT
                                      }
                                    }
                                  },
                                }
                              }
                            }
                          },
                          set:{
                            ...game_player,
                          }
                        },
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startMission: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['MissionPhaseStart'], local?:boolean})=>{
              let [mission_phase_start, log_time] = args;
              if(local){
                game.missions[mission_phase_start.Mission] = { 
                  mission_phase_start: { ...mission_phase_start, log_time, chatIndex: game.chat.length, created_at: new Date() },
                  mission_phase_end: null
                }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  missions:{
                    update:{
                      [mission_phase_start.Mission]:{
                        mission_phase_start: { ...mission_phase_start, log_time, chatIndex: game.chat.length }
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endMission: {
          compute(game) {
            return ({args, local=false}:{args:LogEvents['MissionPhaseEnd'], local?:boolean})=>{
              let [mission_phase_end, log_time] = args;
              let mission = game.missions[mission_phase_end.Mission];
              if(!mission)
                throw Error("Something went wrong, no mission found.");
              let propNumber = getCurrentNumProposals(game.game_players, mission_phase_end.Mission);
              let deltaT = log_time.valueOf() - mission.mission_phase_start.log_time.valueOf();
              if(local){
                mission.mission_phase_end = { ...mission_phase_end, log_time, chatIndex:game.chat.length, deltaT, propNumber, created_at:new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  missions:{
                    update:{
                      [mission_phase_end.Mission]:{ //[mission_phase_end.Mission]
                        upsert:{
                          update:{
                            mission_phase_end: { ...mission_phase_end, log_time, chatIndex:game.chat.length, deltaT, propNumber }
                          },
                          set:{
                            mission_phase_start: mission.mission_phase_start,
                            mission_phase_end: { ...mission_phase_end, log_time, chatIndex:game.chat.length, deltaT, propNumber }
                          }
                        }
                      }
                    }
                  },
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endGame: {
          compute(game) {
            return async ({args, local=false}:{args:LogEvents['GameEnd'], local?:boolean})=>{
              let [game_end, log_time] = args;
              if(!game.game_start)
                throw Error("Something went wrong, game_start not found");
              let deltaT = log_time.valueOf() - game.game_start.log_time.valueOf();
              let playerIds = await Promise.all(game_end.PlayerIdentities.map(async playerIdentity=>{
                let player = await database.player.createOrFind({data:{
                  name:playerIdentity.Nickname,
                  steam_id: playerIdentity.Steamid,
                  level: playerIdentity.Level,
                }}, {where:{steam_id:playerIdentity.Steamid}});
                return player.id
              }));
              if(local){
                game.player_ids = playerIds;
                game.game_end = { ...game_end, log_time, deltaT, chatIndex: game.chat.length, created_at: new Date() }
                game.latest_log_time = log_time;
                return game;
              }
              else
                return database.game.update({where:{id:game.id}, data:{
                  game_end: { ...game_end, log_time, deltaT, chatIndex: game.chat.length },
                  player_ids: playerIds,
                  latest_log_time: log_time
                }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $syncLocal: {
          compute(game) {
            return ()=>{
              let prepForUpload = { ...database.game.polish(game), id:undefined }
              return database.game.update({where:{id:game.id}, data:prepForUpload});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
      },
      globalChatMessage:{
        $test:{
          compute(data) {
            return ({local}:{local?:boolean})=>{
              // let [spawn_player, log_time] = spawnPlayerArgs;
              console.log('db', data.Message);
              data.Message = "yooo";
              return data;
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        }
      },
      // $allModels:{
      //   $toJson:{
      //     compute(data) {
      //       return ()=>{
      //         return data;
      //       }
      //     },
      //   }
      // }
    },
    // result: { //TODO nextjs not allowing symbols on functions?
    //   $allModels:{
    //     $save: {
    //       // needs: { id: true },
    //       compute(data:any) {
    //         "use server";
    //         return async () =>{
    //           "use server"; //have to mark these otherwise nextjs complains
    //           const ctx = Prisma.getExtensionContext(this) as any;
    //           // const ctx = prisma.client;
    //           return ctx.update({ where: { id: data.id }, data: data }) as Promise< void > //TODO, return typing: Promise< Prisma.Result<T, undefined, 'findFirstOrThrow'> >
    //         }
    //       },
    //     },
    //   }
    // },
    model: {
      $allModels:{
        async createOrFind<T, A extends Prisma.Args<T, 'create'>>(
          this: T,
          createArgs: A,
          queryArgs?: Prisma.Args<T, 'findFirst'>,
        ):Promise< Prisma.Result<T, A, 'create'> >{  //let t = await prisma.mindnightSession.create({  }); let q = prisma.mindnightSession.findFirst({})
          const ctx = Prisma.getExtensionContext<T>(this);
          let record = queryArgs ? 
                        await (ctx as any).findFirst(queryArgs) : 
                        await (ctx as any).findFirst({where:replaceArraysWithEquals(createArgs.data), include:createArgs.include, select:createArgs.select });
          if(!record)
            record = await (ctx as any).create(createArgs);
          return record;
        },
        findManyAndCount<Model, Args>(
          this: Model,
          args: Prisma.Exact<Args, Prisma.Args<Model, 'findMany'>>
        ): Promise<[Prisma.Result<Model, Args, 'findMany'>, number]> {
          return prisma.$transaction([
            (this as any).findMany(args),
            (this as any).count({ where: (args as any).where })
          ]) as any;
        },
        findById<T>(
          this: T,
          id: string
        ):Promise< Prisma.Result<T, undefined, 'findFirstOrThrow'> >{
          const ctx = Prisma.getExtensionContext(this);
          return  (ctx as any).findFirstOrThrow({where:{id}});
        },
        polish<T>(
          this:T, 
          valueToPolish:Prisma.Args<T, 'create'>['data'], //corresponding model input type
          schemaName = Prisma.getExtensionContext(this).$name
        ) :NonNull< Prisma.Result<T, undefined, 'findFirst'> >/* corresponding model return type */ {
          // let t:Prisma.Result<T, undefined, 'findFirst'>;
          /* TODO: explore Prisma.TypeMap */
          let ctx = Prisma.getExtensionContext(this);
          if(Array.isArray(valueToPolish))//@ts-expect-error
            return valueToPolish.map(v=>this.polish(v, schemaName)) // handle arrays of schema values
          if(typeof valueToPolish !== 'object' || valueToPolish === null)
            return valueToPolish;
          let schemaReference = Prisma.dmmf.datamodel.models.find(m=>m.name==schemaName) || Prisma.dmmf.datamodel.types.find(t=>t.name==schemaName);
          // console.log('SCHEMA_NAME', schemaName);
          // console.log('SCHEMA', schemaReference); //DEBUG
          let polishedData = {} as NonNull< Prisma.Result<T, undefined, 'findFirst'> >;
          schemaReference?.fields.forEach(field=>{
            // console.log('FIELD', field); //DEBUG
            let value = valueToPolish[field.name];
            if(value==undefined) // SOURCE FROM DBNAME such as __v in the case that v doesnt exist
              value=(field.dbName && valueToPolish[field.dbName])
            // console.log('value', value); //DEBUG
            if(field.kind === 'object') {
              //@ts-expect-error
              value = this.polish(value, field.type); //Prisma.getExtensionContext(this) this is helpful too, in case of differing order of definition
            }
            //@ts-expect-error
            polishedData[field.name] = value;
          });
          // console.log('OG',modelName,Object.keys(valueToPolish)); //DEBUG
          // console.log('POLISHED', modelName, Object.keys(polishedData)); //DEBUG
          return polishedData;
        }
      },
      mindnightSession:{
        async authenticate(session:MindnightSession){
          return await prisma.mindnightSession.update({where:{id:session.id}, data:{status:'authenticated'}});
        },
        async ready(session:MindnightSession){
          return await prisma.mindnightSession.update({where:{id:session.id}, data:{status:'ready'}});
        },
        async playing(session:MindnightSession){
          return await prisma.mindnightSession.update({where:{id:session.id}, data:{status:'playing'}});
        }
      },
      
    },
  })
}
/*
{
  id: '123',
  game_found:{...game_found, log_time, created_at:new Date()},
  chat: [],
  missions: {1:null, 2:null,3:null,4:null,5:null},
  game_start: null,
  game_end: null,
  game_players: {0:null,1:null, 2:null,3:null,4:null,5:null,6:null,7:null},
  player_ids: [],
  created_at: new Date(),
  updated_at: new Date(),
}
*/
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const database = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV === 'development') globalThis.prismaGlobal = database;

//awesome post for features: https://github.com/prisma/prisma/issues/7161#issuecomment-1026317110
//custom computed fields: https://www.prisma.io/docs/orm/prisma-client/queries/computed-fields
//custom validation: https://www.prisma.io/docs/concepts/components/prisma-client/custom-validation
// !!! custom models: .findManyByDomain() : https://www.prisma.io/docs/concepts/components/prisma-client/custom-validation



//WHOA figure out this typing: (done, it creates a __typename Result extension that is mapped to modelName)

// const typeExtension = Prisma.defineExtension((client) => {
//   type ModelKey = Exclude<keyof typeof client, `$${string}` | symbol>;
//   type Result = {
//     [K in ModelKey]: { __typename: { needs: Record<string, never>; compute: () => K } };
//   };

//   const result = {} as Result;
//   const modelKeys = Object.keys(client).filter((key) => !key.startsWith('$')) as ModelKey[];
//   modelKeys.forEach((k) => {
//     result[k] = { __typename: { needs: {}, compute: () => k as any } };
//   });

//   return client.$extends({ result });
// });

// type ExtensionArgs = Extract<
//   Parameters<typeof database.$extends>["0"],
//   { name?: string }
// >