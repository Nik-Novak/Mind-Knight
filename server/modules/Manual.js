//@ts-check
const fs = require('fs');
const _ = require('lodash');
const util = require('util');
const moment = require('moment');
const GameBuilder = require('./GameBuilder');

class Manual {
  constructor(database){
    this.database=database;
  }

  /**
   * 
   * @param {*} options Provide either an ID fromt eh database OR the raw game content itself 
   */
  async buildRawGames({rawGameID=undefined, rawLogData=undefined}){
    let testGameBuilder = new GameBuilder();
    let rawGame;
    if(rawGameID)
      rawGame = (await this.database.getRawGame({_id:rawGameID})).data;
    else
      rawGame = rawLogData;
    let startPoint = rawGame.indexOf('Received GameFound') - 50;
    let games = testGameBuilder.buildGamesFromLog(rawGame, startPoint);
    return games;
  }

  async retroactiveBuildAndUploadRawGame(UUID, {rawGameID=undefined, rawLogData=undefined}){
    if(rawGameID){
      let games = await this.buildRawGames({rawGameID});
      console.log(games.length)
      this.database.uploadGameData(UUID,games[0],{rawGameID});
    }
  }

  async manuallyCreateMMSQualifiers(){
    // let mmsQualifiers = {
    //   name: 'MMS Qualifiers',
    //   created: moment('13-07-2020', 'DD-MM-YYYY').toDate(),
    //   roster:
    // }
  }

  async manuallyCreateMMSTournament(){
    let mmsTournament = {
      name: 'Mindnight Master Series Open',
      created: moment('13-07-2020', 'DD-MM-YYYY').toDate(),
      
    }
  }

  async manuallyCreateCV2020Tournament(){
    let CV2020Tournament = 
      {
        name:'CV 2020 Invitational',
        created: moment('08-05-2020', 'DD-MM-YYYY').toDate(),
        roster: 
        [ 
          { playerID: (await this.database.getOrCreatePlayer('76561198814206069', 'joshua.cunningham'))._id }, //0
          { playerID: (await this.database.getOrCreatePlayer('76561198027955330', 'Kain42link42'))._id }, //1
          { playerID: (await this.database.getOrCreatePlayer('76561198073023481', '2JZ 4U'))._id }, //2
          { playerID: (await this.database.getOrCreatePlayer('76561198153071747', 'arsynal'))._id }, //3
          { playerID: (await this.database.getOrCreatePlayer('76561198204964299', 'Plimpton'))._id }, //4
          { playerID: (await this.database.getOrCreatePlayer('76561197998392766', 'Little Dog'))._id }, //5
          { playerID: (await this.database.getOrCreatePlayer('76561198068394804', 'blueicyflame'))._id }, //6
          { playerID: (await this.database.getOrCreatePlayer('76561198354769854', 'russandra228'))._id }, //7
          { playerID: (await this.database.getOrCreatePlayer('76561198189712506', 'Philliedips'))._id }, //8
          { playerID: (await this.database.getOrCreatePlayer('76561198207913199', 'LK'))._id }, //9
          { playerID: (await this.database.getOrCreatePlayer('76561198799350618', 'naseem_1378'))._id }, //10
          { playerID: (await this.database.getOrCreatePlayer('76561198236702268', 'Paceswifty'))._id }, //11
          { playerID: (await this.database.getOrCreatePlayer('76561198358260106', 'AustinTheSlow'))._id }, //12
          { playerID: (await this.database.getOrCreatePlayer('76561198037188073', 'Kira110'))._id }, //13
          { playerID: (await this.database.getOrCreatePlayer('76561199012217952', 'Jemma'))._id }, //14
        ],    
        backup_roster:
        [
          { playerID: (await this.database.getOrCreatePlayer('steamID_bkp_0', 'ukplug01'))._id }
        ],
        days: 
        [
          { //DAY 1
            date: moment('10-05-2020', 'DD-MM-YYYY').toDate(),
            heats: 
            [ 
              { //heat 1
                games: 
                [ 
                  { player_roster_indexes: [5, 6, 1, 14, 4], 
                    scheduled: new Date('2020-05-10T20:00:00-0400'),
                    gameID: '5eb89bab3ae97e2d48244423'
                  }, 
                  { player_roster_indexes: [5, 6, 1, 14, 4], 
                    scheduled: new Date('2020-05-10T20:45:00-0400'),
                    gameID: '5eb8a18a3ae97e2d482445ad'
                  }, 
                  { player_roster_indexes: [5, 6, 1, 14, 4], 
                    scheduled: new Date('2020-05-10T21:30:00-0400'),
                    gameID: '5ecc7a80f49e17f585440995'
                  }
                ] 
              },
              { //heat 2
                games: 
                [ 
                  { player_roster_indexes: [12, 7, 11, 2, 13], 
                    scheduled: new Date('2020-05-10T20:00:00-0400'),
                    gameID: '5ecc8a9e96f6c0359a91e468'
                  }, 
                  { player_roster_indexes: [12, 7, 11, 2, 13], 
                    scheduled: new Date('2020-05-10T20:45:00-0400'),
                    gameID: '5eb8c72332dac83e808f4c6f'
                  }, 
                  { player_roster_indexes: [12, 7, 11, 2, 13], 
                    scheduled: new Date('2020-05-10T21:30:00-0400'),
                    gameID: '5eb8c90632dac83e808f4d85'
                  }
                ] 
              },
              { //heat 3
                games: 
                [ 
                  { player_roster_indexes: [8, 3, 0, 10, 9],
                    scheduled: new Date('2020-05-11T00:00:00-0400'),
                    gameID: '5eb8d94d04515830c49cd02c'
                  }, 
                  { player_roster_indexes: [8, 3, 0, 10, 9],
                    scheduled: new Date('2020-05-11T00:45:00-0400'),
                    gameID: '5ecc8e55ca619b3e62f72121'
                  }, 
                  { player_roster_indexes: [8, 3, 0, 10, 9],
                    scheduled: new Date('2020-05-11T01:30:00-0400'),
                    gameID: '5ecc8fa4fcad0b483ea4c351' 
                  }
                ] 
              }
            ]
          },
          { //DAY 2
            date: moment('11-05-2020', 'DD-MM-YYYY').toDate(),
            heats:
            [ 
              { //heat 1
                games: 
                [ 
                  { player_roster_indexes: [1, 13, 3, 9, 14], 
                    scheduled: new Date('2020-05-12T00:00:00-0400'),
                    gameID: '5ebc2a25883e7aa24074b1ae'
                  }, 
                  { player_roster_indexes: [1, 13, 3, 9, 14], 
                    scheduled: new Date('2020-05-12T00:45:00-0400'),
                    gameID: '5ebc2a4f883e7aa24074b529'
                  }, 
                  { player_roster_indexes: [1, 13, 3, 9, 14],
                    scheduled: new Date('2020-05-12T01:30:00-0400'),
                    gameID: '5ebc2a5d883e7aa24074ba1c'
                  }
                ] 
              },
              { //heat 2
                games: 
                [ 
                  { player_roster_indexes: [2, 12, 7, 4, 6],
                    scheduled: new Date('2020-05-11T20:00:00-0400'),
                    gameID: '5eb9efd53d601749f8e558ea'
                  }, 
                  { player_roster_indexes: [2, 12, 7, 4, 6],
                    scheduled: new Date('2020-05-11T20:45:00-0400'),
                    gameID: '5eb9f9453d601749f8e55b64'
                  }, 
                  { player_roster_indexes: [2, 12, 7, 4, 6], 
                    scheduled: new Date('2020-05-11T21:30:00-0400'),
                    gameID: '5eb9fc6d3d601749f8e55ebd'
                  }
                ] 
              },
              { //heat 3
                games: 
                [ 
                  { player_roster_indexes: [11 ,5, 0, 8, 10], 
                    scheduled: new Date('2020-05-12T00:00:00-0400'),
                    gameID: '5eba2555ddef5a53543ed15f'
                  }, 
                  { player_roster_indexes: [11 ,5, 0, 8, 10], 
                    scheduled: new Date('2020-05-12T00:45:00-0400'),
                    gameID: '5eba2db2ddef5a53543ed34e'
                  }, 
                  { player_roster_indexes: [11 ,5, 0, 8, 10], 
                    scheduled: new Date('2020-05-12T01:30:00-0400'),
                    gameID: '5eba316bddef5a53543ed61d'
                  }
                ] 
              }
            ]
          },
          { //DAY 3
            date: moment('12-05-2020', 'DD-MM-YYYY').toDate(),
            heats:
            [ 
              { //heat 1
                games: 
                [ 
                  { player_roster_indexes: [1, 3, 9, 4, 7], 
                    scheduled: new Date('2020-05-13T00:00:00-0400'),
                    gameID: '5ebb7e046ca4d532d8f72720'
                  }, 
                  { player_roster_indexes: [1, 3, 9, 4, 7], 
                    scheduled: new Date('2020-05-13T00:45:00-0400'),
                    gameID: '5ebb846e6ca4d532d8f72d01'
                  }, 
                  { player_roster_indexes: [1, 3, 9, 4, 7],
                    scheduled: new Date('2020-05-13T01:30:00-0400'),
                    gameID: '5ecc96782e6b8f6736269b83'
                  }
                ] 
              },
              { //heat 2
                games: 
                [ 
                  { player_roster_indexes: [11, 13, 6, 2, 5],
                    scheduled: new Date('2020-05-12T20:00:00-0400'),
                    gameID: '5ebb555bea6e5093e869a7e4'
                  }, 
                  { player_roster_indexes: [11, 13, 6, 2, 5],
                    scheduled: new Date('2020-05-12T20:45:00-0400'),
                    gameID: '5ebb5e1bea6e5093e869aa2f'
                  }, 
                  { player_roster_indexes: [11, 13, 6, 2, 5], 
                    scheduled: new Date('2020-05-12T21:30:00-0400'),
                    gameID: '5ebb678bea6e5093e869ad7f'
                  }
                ] 
              },
              { //heat 3
                games: 
                [ 
                  { player_roster_indexes: [0, 12, 10, 8, 14], 
                    scheduled: new Date('2020-05-13T00:00:00-0400'),
                    gameID: '5ecc9f3308b35600b77684d4'
                  }, 
                  { player_roster_indexes: [0, 12, 10, 8, 14], 
                    scheduled: new Date('2020-05-13T00:45:00-0400'),
                    gameID: '5ebb7e85f3ff7a62647e4e72'
                  }, 
                  { player_roster_indexes: [0, 12, 10, 8, 14], 
                    scheduled: new Date('2020-05-13T01:30:00-0400'),
                    gameID: '5ecc9e060baadb7b12d27900'
                  }
                ] 
              }
            ]
          },
          { //DAY 4
            date: moment('13-05-2020', 'DD-MM-YYYY').toDate(),
            heats:
            [ 
              { //heat 1
                games: 
                [ 
                  { player_roster_indexes: [1, 4, 3, 6, 5], 
                    scheduled: new Date('2020-05-14T00:00:00-0400'),
                    gameID: '5ebcce8b85f20634b4dd7dfa'
                  }, 
                  { player_roster_indexes: [1, 4, 3, 6, 5], 
                    scheduled: new Date('2020-05-14T00:45:00-0400'),
                    gameID: '5ebcda69675bb139ccebd44c'
                  }, 
                  { player_roster_indexes: [1, 4, 3, 6, 5],
                    scheduled: new Date('2020-05-14T01:30:00-0400'),
                    gameID: '5ebce6b4675bb139ccebd8c3'
                  }
                ] 
              },
              { //heat 2
                games: 
                [ 
                  { player_roster_indexes: [2, 0, 7, 9, 11],
                    scheduled: new Date('2020-05-13T20:00:00-0400'),
                    gameID: '5ebc951b41ddbc3df854e862'
                  }, 
                  { player_roster_indexes: [2, 0, 7, 9, 11],
                    scheduled: new Date('2020-05-13T20:45:00-0400'),
                    gameID: '5ebca56841ddbc3df854eb0e'
                  }, 
                  { player_roster_indexes: [2, 0, 7, 9, 11], 
                    scheduled: new Date('2020-05-13T21:30:00-0400'),
                    gameID: '5ecca4e33bc6828c729da332'
                  }
                ] 
              },
              { //heat 3
                games: 
                [ 
                  { player_roster_indexes: [12, 13, 10, 14, 8], 
                    scheduled: new Date('2020-05-14T00:00:00-0400'),
                    gameID: '5ebcd104afdbd961d8712292'
                  }, 
                  { player_roster_indexes: [12, 13, 10, 14, 8], 
                    scheduled: new Date('2020-05-14T00:45:00-0400'),
                    gameID: '5ebcdbb0afdbd961d8712684'
                  }, 
                  { player_roster_indexes: [12, 13, 10, 14, 8], 
                    scheduled: new Date('2020-05-14T01:30:00-0400'),
                    gameID: '5ebce0d7afdbd961d871295e'
                  }
                ] 
              }
            ]
          },
          { //DAY 5
            date: moment('17-05-2020', 'DD-MM-YYYY').toDate(),
            heats:
            [ 
              { //heat 1
                games: 
                [ 
                  { player_roster_indexes: [3, 1, 4, 9, 0], 
                    scheduled: new Date('2020-05-18T00:00:00-0400'),
                    gameID: '5ecb57ba59cc6d1098bdc5f8'
                  }, 
                  { player_roster_indexes: [3, 1, 4, 9, 0], 
                    scheduled: new Date('2020-05-18T00:45:00-0400'),
                    gameID: '5ecb5d8259cc6d1098bdc735'
                  }, 
                  { player_roster_indexes: [3, 1, 4, 9, 0],
                    scheduled: new Date('2020-05-18T01:30:00-0400'),
                    gameID: '5ecb6c8259cc6d1098bdc888'
                  }
                ] 
              },
              { //heat 2
                games: 
                [ 
                  { player_roster_indexes: [6, 2, 5, 7, 13],
                    scheduled: new Date('2020-05-17T20:00:00-0400'),
                    gameID: '5ec5d7e79befdf32b45b69df'
                  }, 
                  { player_roster_indexes: [6, 2, 5, 7, 13],
                    scheduled: new Date('2020-05-17T20:45:00-0400'),
                    gameID: '5ec5e4ca9befdf32b45b6e63'
                  }, 
                  { player_roster_indexes: [6, 2, 5, 7, 13], 
                    scheduled: new Date('2020-05-17T21:30:00-0400'),
                    gameID: '5ec5ee879befdf32b45b732e'
                  }
                ] 
              },
              { //heat 3
                games: 
                [ 
                  { player_roster_indexes:  [10, 12, 11, 8, 14], 
                    scheduled: new Date('2020-05-17T19:00:00-0400'),
                    gameID: '5ec1bcfc180dac081c4659f2'
                  }, 
                  { player_roster_indexes:  [10, 12, 11, 8, 14], 
                    scheduled: new Date('2020-05-17T19:45:00-0400'),
                    gameID: '5ec1c0e1180dac081c465c6f'
                  }, 
                  { player_roster_indexes:  [10, 12, 11, 8, 14], 
                    scheduled: new Date('2020-05-17T20:30:00-0400'),
                    gameID: '5ec1c5b6180dac081c465dad'
                  }
                ] 
              }
            ]
          },
          
        ]
      }
    this.database.addStandardTournament(CV2020Tournament);
  }
}

module.exports = { Manual }


