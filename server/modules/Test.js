//@ts-check
const fs = require('fs');
const _ = require('lodash');
const util = require('util');
const GameBuilder = require('./GameBuilder');

const Logger = require('./Logger');
new Logger().cloneOutputToFile('./logs/debug.log', {wipe:true});

class Test {
  constructor(gamebuilder, database){
    this.gamebuilder=gamebuilder;
    this.database=database;
  }

  simulate(){
    console.log('INITIATING SIMULATION');
    // let simFile = 'output_log_beforeGameEnd.txt'; //WORKS PERFECTLY, game 2 folder
    let simFile = './sample_games/kain_day2_heat1.log';//'./sample_games/Game 7/Mindnight/Player_beforeGameEnd.log'; // './sample_games/TM symbol crashing - Player.log' //'output_log_afterGameEnd.log'//'output_log_beforeGameEnd.txt'//'output_log.txt'//'output_log_beforeGameEnd.txt';
    var lineReader = require('readline').createInterface({
        input: fs.createReadStream(simFile)
    });
    let lines = [];
    lineReader.on('line', function (line) {
        if(line.length===0)
            return;
        lines.push(line);
    });
    let lineReadInterval = setInterval(()=>{
        let line = lines.shift();
        if(!line){
            clearInterval(lineReadInterval);
            return;
        }
        // console.log('Line:', line);
        this.gamebuilder.process(line);
    }, 5);
  }

  async test(){
    console.log('INITIATING TEST');
    // let kain = await database.getOrCreatePlayer('76561198027955330', 'Kain42link42');
    // database.test();
    // testBuildingRawGameFromDB();
  }
  // test();
  
  async fixDeletedUser(kain){
    const { Player } = require('./custom_modules/models/Player');
    let allGames = (await database.getGames({}));
    let brokenLinkGames = [];
    let kainGames = [];
    allGames.forEach(async game=>{
      for(let playerIdentity of game.game_end.PlayerIdentities){
        if(playerIdentity.Nickname=='Kain42link42'){
          kainGames.push(game);
          // Player.updateOne({_id:kain._id}, {$push:{gameIDs:game._id, raw_gameIDs:game.raw_gameID}})
        }
        // let player = await database.getPlayer({ name:playerIdentity.Nickname, gameIDs:game._id });
        // if(!player){
        //   console.log('FOUND BROKEN LINK GAME:', game._id);
        //   console.log('BROKEN FOR PLAYER:', playerIdentity.Nickname);
        //   brokenLinkGames.push(game);
        // }
      };
    });
    kainGames=kainGames.sort((a,b)=>new Date(a.game_start.timestamp).getTime() - new Date(b.game_start.timestamp).getTime());
    // kainGames.forEach(async game=>await Player.updateOne({_id:kain._id}, {$push:{gameIDs:game._id, raw_gameIDs:game.raw_gameID}}))
  }
  
  async buildRawGamesFromFile(){
    // database.test();
    let log = fs.readFileSync('./sample_games/tourny_day1_heat3_pace.log').toString();
    let testGameBuilder = new GameBuilder();
    let games = testGameBuilder.buildGamesFromLog(log);
    return games;
  }
  
  async buildRawGames({rawGameID=undefined, rawLogData=undefined}){
    let testGameBuilder = new GameBuilder();
    let rawGame;
    if(rawGameID)
      rawGame = (await this.database.getRawGame({_id:rawGameID})).data;
    else
      rawGame = rawLogData;
    let startPoint = rawGame.indexOf('Received GameFound') - 50;
    let games = testGameBuilder.buildGamesFromLog(rawGame.data, startPoint);
    return games;
  }
}

module.exports = { Test }


