import { LogEvents } from '@/utils/classes/LogReader';
import { getCurrentMissionNumber, getCurrentNumProposals, getLatestProposal } from '@/utils/functions/game';
import { PrismaClient, PlayerIdentity, Prisma, Game, Client, MindnightSession, MindnightSessionStatus,  } from '@prisma/client'
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
          compute(data) {
            return (...spawnPlayerArgs:LogEvents['SpawnPlayer'])=>{
              let [spawn_player, log_time] = spawnPlayerArgs;
              
              return database.game.update({where:{id:data.id}, data:{
                game_players: {
                  [spawn_player.Slot]: {...spawn_player,  proposals:{}, log_time }
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startGame: {
          compute(data) {
            return (...args:LogEvents['GameStart'])=>{
              let [game_start, log_time] = args;
              
              return database.game.update({where:{id:data.id}, data:{
                game_start: {...game_start, log_time}
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $addChatMessage: {
          compute(data) {
            return (...args:LogEvents['ChatMessageReceive'])=>{
              let [chat_message_receive, log_time] = args;
              
              return database.game.update({where:{id:data.id}, data:{
                chat: {push:{
                  ...chat_message_receive,
                  log_time
                }}
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startProposal: {
          compute(data) {
            return (...args:LogEvents['SelectPhaseStart'])=>{
              let [select_phase_start, log_time] = args;
              let propNumber = getCurrentNumProposals(data.game_players, select_phase_start.Mission) + 1; 
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = data.game_players[select_phase_start.Player];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              return database.game.update({where:{id:data.id}, data:{
                game_players:{
                  update:{
                    [select_phase_start.Player]:{
                      upsert:{
                        update:{
                          proposals:{
                            update:{
                              [select_phase_start.Mission]:{
                                push: {
                                  select_phase_start: {...select_phase_start, chatIndex: data.chat.length, log_time, propNumber},
                                  vote_mades: {}
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
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $updateProposalSelection: {
          compute(data) {
            return (...args:LogEvents['SelectUpdate'])=>{
              let [select_update, log_time] = args;
              let missionNum = getCurrentMissionNumber(data.missions);
              let latestProposal = getLatestProposal(data.game_players, missionNum);
              if(!latestProposal)
                throw Error("Something went wrong. Could not find the latest proposal..");
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = data.game_players[latestProposal.playerSlot];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              // let newProposals = [ ...game_player.proposals[missionNum] ];
              // latestProposal.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
              // newProposals[latestProposal.proposalIndex].select_updates.push({ ...select_update, chatIndex: data.chat.length, log_time })
              return database.game.update({where:{id:data.id}, data:{
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
                                  data:{ select_updates:{ push: { ...select_update, chatIndex: data.chat.length, log_time }} } 
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
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endProposal: {
          compute(data) {
            return (...args:LogEvents['SelectPhaseEnd'])=>{
              let [select_phase_end, log_time] = args;
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = data.game_players[select_phase_end.Proposer];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              let missionNum = getCurrentMissionNumber(data.missions);
              let latestProposal = game_player.proposals[missionNum][game_player.proposals[missionNum].length-1];
              let deltaT = log_time.valueOf() - latestProposal.select_phase_start.log_time.valueOf();
              return database.game.update({where:{id:data.id}, data:{
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
                                      ...select_phase_end, chatIndex: data.chat.length, log_time, deltaT
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
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startVote: {
          compute(data) {
            return (...args:LogEvents['VotePhaseStart'])=>{
              let [vote_phase_start, log_time] = args;
              // let propNumber = getCurrentNumProposals(data.game_players, select_phase_start.Mission) + 1; 
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = data.game_players[vote_phase_start.Proposer];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              let missionNum = getCurrentMissionNumber(data.missions);
              let latestProposal = game_player.proposals[missionNum][ game_player.proposals[missionNum].length-1 ];
              return database.game.update({where:{id:data.id}, data:{
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
                                  data: { vote_phase_start: { ...vote_phase_start, chatIndex:data.chat.length, log_time } }
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
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $addVoteMade: {
          compute(data) {
            return (...args:LogEvents['VoteMade'])=>{
              let [vote_made, log_time] = args;
              let missionNum = getCurrentMissionNumber(data.missions);
              let latestProposal = getLatestProposal(data.game_players, missionNum);
              if(!latestProposal)
                throw Error("Something went wrong. Could not find the latest proposal..");
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let game_player = data.game_players[latestProposal.playerSlot];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              // let newProposals = [ ...game_player.proposals[missionNum] ];
              // latestProposal.select_updates.push({...select_update, chatIndex: game.chat.length, log_time, created_at:new Date()});
              // newProposals[latestProposal.proposalIndex].select_updates.push({ ...select_update, chatIndex: data.chat.length, log_time })
              if(!latestProposal.value.vote_phase_start)
                throw Error("Somethign went wrong, no vote_phase_start.")
              let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
              return database.game.update({where:{id:data.id}, data:{
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
                                            ...vote_made, chatIndex:data.chat.length, log_time, deltaT
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
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endVote: {
          compute(data) {
            return (...args:LogEvents['VotePhaseEnd'])=>{
              let [vote_phase_end, log_time] = args;
              //game.game_players[select_phase_start.Player]?.proposals[select_phase_start.Mission].push(proposal)
              let missionNum = getCurrentMissionNumber(data.missions);
              let latestProposal = getLatestProposal(data.game_players,missionNum);
              if(!latestProposal)
                throw Error("Something went wrong, latestProposal not found.");
              let game_player = data.game_players[latestProposal.playerSlot];
              if(!game_player)
                throw Error("Somethign went wrong, game_player was not found.");
              if(!latestProposal.value.vote_phase_start)
                throw Error("Something went wrong, no vote_phase_start for latest proposal.");
              let deltaT = log_time.valueOf() - latestProposal.value.vote_phase_start.log_time.valueOf();
              return database.game.update({where:{id:data.id}, data:{
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
                                      ...vote_phase_end, chatIndex: data.chat.length, log_time, deltaT
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
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $startMission: {
          compute(data) {
            return (...args:LogEvents['MissionPhaseStart'])=>{
              let [mission_phase_start, log_time] = args;
              return database.game.update({where:{id:data.id}, data:{
                missions:{
                  update:{
                    [mission_phase_start.Mission]:{
                      mission_phase_start: { ...mission_phase_start, log_time, chatIndex: data.chat.length }
                    }
                  }
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endMission: {
          compute(data) {
            return (...args:LogEvents['MissionPhaseEnd'])=>{
              let [mission_phase_end, log_time] = args;
              let mission = data.missions[mission_phase_end.Mission];
              if(!mission)
                throw Error("Something went wrong, no mission found.");
              let propNumber = getCurrentNumProposals(data.game_players, mission_phase_end.Mission);
              let deltaT = log_time.valueOf() - mission.mission_phase_start.log_time.valueOf()
              return database.game.update({where:{id:data.id}, data:{
                missions:{
                  update:{
                    [mission_phase_end.Mission]:{ //[mission_phase_end.Mission]
                      upsert:{
                        update:{
                          mission_phase_end: { ...mission_phase_end, log_time, chatIndex:data.chat.length, deltaT, propNumber }
                        },
                        set:{
                          mission_phase_start: mission.mission_phase_start,
                          mission_phase_end: { ...mission_phase_end, log_time, chatIndex:data.chat.length, deltaT, propNumber }
                        }
                      }
                    }
                  }
                }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
        $endGame: {
          compute(data) {
            return (...args:LogEvents['GameEnd'])=>{
              let [game_end, log_time] = args;
              if(!data.game_start)
                throw Error("Something went wrong, game_start not found");
              let deltaT = log_time.valueOf() - data.game_start.log_time.valueOf()
              return database.game.update({where:{id:data.id}, data:{
                game_end: { ...game_end, log_time, deltaT, chatIndex: data.chat.length }
              }});
              // data.game_players[spawn_player.Slot] = {...spawn_player, chat:[], proposals:{1:[], 2:[], 3:[], 4:[], 5:[]}, log_time, created_at:new Date() }
            }
          },
        },
      }
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
        async findOrCreate<T, A extends Prisma.Args<T, 'create'>>(
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
