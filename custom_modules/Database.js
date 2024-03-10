//@ts-check
var fs = require('fs-extra');
var os = require('os');
const _ = require('lodash');
const moment = require('moment');

const {
    execSync
} = require('child_process');

const mongoose = require('./Models').mongoose;
const { Game, RawGame } = require('./models/Game');
const { User } = require('./models/User');
const { Player } = require('./models/Player');
const { StandardTournament } = require('./models/Tournament');

class Database {
    constructor(db, au) {
      let connectString = db.split('//');
      connectString[0]+=`//${au.u}:${au.p}`;
      // @ts-ignore
      connectString = connectString.join('@');
      this.database = this.connectToDB(connectString, mongoose);
      this.fileCheckpoint = 0;
    }
    
    connectToDB(db, mongoose) {
        return new Promise(function(resolve,reject){
          mongoose.connect(db, 
            { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
          );
          mongoose.connection.once('open', (conn)=>{
            console.log('Connected to DB.');
            resolve(mongoose.connection);
          });
          mongoose.connection.on('error', (err)=>{
            console.log('Error in DB connection.');
            reject(err);
          });
        });
      }

    uploadGame(game, rawLogFilepath) {
        let deepCopyGame = _.cloneDeep(game);
        let rawLogData = this.readLogFile(rawLogFilepath);
        let tmp = rawLogData.length; //store the legtnh of the file as a checkpoint
        rawLogData = rawLogData.substring(this.fileCheckpoint);
        let UUID = this.getID();
        this.fileCheckpoint=tmp;
        this.uploadGameData(UUID, deepCopyGame, rawLogData);
    }

    
    
    resetCheckpoint(){
        this.fileCheckpoint=0;
    }

    readLogFile(filepath) {
        // @ts-ignore
        let data = fs.readFileSync(filepath, "utf8", function (err) {
            if (err) {
                console.log("[ERROR] Error in reading log file to be uploaded \n" + err);
                return;
            }
        });

        console.log('Successfully read log file: \n');
        return data.toString();
    }

    async login(steamID, name){
      if(steamID){ //conventional login
        let localPlayer = await this.getOrCreatePlayer(steamID, name);
        let UUID = this.getID();
        let user;
        if(localPlayer)
          user = await this.getOrCreateUser(UUID, localPlayer._id);
        if (user && localPlayer)
          return {user, localPlayer};
      }
      let user = await this.getOrCreateUser(this.getID()); //last ditch attempt to login via ID
      if(user){
        // @ts-ignore
        let localPlayer = await Player.findOne({_id:user.playerID});
        if(localPlayer)
          return { user, localPlayer };
      }
      throw Error('Unable to login and insufficient knowledge to create an account. Try running the client, then opening mindnight to fix this.')
    }

    getID() {
      if(this.UUID) //if we've already retrieved it
        return this.UUID
      let stdout = execSync('wmic csproduct get UUID');
      this.UUID = stdout.toString('utf8').split(os.EOL)[1].trim();
      return this.UUID;
    }

    async getPlayer(query){
      return await Player.findOne(query);
    }

    async getOrCreatePlayer(steamID, name){
      let player = await Player.findOne({steamID});
      if(!player)
        player = await new Player({ steamID, name }).save();
      // @ts-ignore
      if(name && player.name!=name){
        Player.update({_id:player._id}, {name});
        // @ts-ignore
        player.name = name;
      }
      return player;
    }

    async updateElo(steamID, name, eloIcrement){
      let player = await this.getOrCreatePlayer(steamID, name);
      player.elo = (player.elo || 1500) + eloIcrement;
      await player.save();
    }

    async getOrCreateUser(UUID, playerID){
      let user = await User.findOne({UUID});
        if(!user)
          user = await new User({UUID, playerID}).save();
        // @ts-ignore
        if(playerID && user.playerID != playerID){
          User.update({_id:user._id}, {playerID})
          // @ts-ignore
          user.playerID = playerID;
        }
      return user;
    }

    verifyUpload(savedObj, obj){
      let equivalent = true;
      let missing = [];
      checkEquiv(savedObj, obj);
      function checkEquiv(savedObj, obj, path=""){
        if(savedObj == obj)
          return;
        if(!savedObj && obj){
          missing.push('Missing: type1', path, savedObj, ' -- ', path, obj);
          equivalent = false; return;
        }
        if(typeof obj == 'object' && obj!=null && Object.getPrototypeOf(obj) == Object.prototype){ //Object.getPrototypeOf(obj) == Object.prototype -> true for plain objects
          if(typeof savedObj != 'object' || savedObj==null || Object.getPrototypeOf(savedObj) != Object.prototype){
            missing.push('Missing: type2', path, savedObj, ' -- ',  path, obj);
            equivalent = false; return;
          }
          for( let [key,value] of Object.entries(obj) ){
            checkEquiv(savedObj[key], value, path+`.${key}`);
          }
          return;
        }
        else if(Array.isArray(obj)){
          if(Array.isArray(savedObj))
            for(let i=0; i<obj.length; i++)
              checkEquiv(savedObj[i], obj[i], path+`.${i}`);
          else {
            missing.push('Missing: type3', path, savedObj, ' -- ', path, obj);
            equivalent=false;
          } 
          return;
        }
        else if( obj instanceof Date ){
          if( !(savedObj instanceof Date) || obj.getTime() != savedObj.getTime() ){
            missing.push('Missing: type4', path, savedObj, ' -- ', path, obj);
            equivalent=false; return;
          }
        }
        else if(savedObj != obj){
          missing.push('Missing: type5', path, savedObj, ' -- ', path, obj);
          equivalent=false; return;
        }
      }
      return { equivalent, missing };
    }

    uploadGameData(UUID, game, rawLogData) {
      this.database.then(async connection=>{
        let timestamp = new Date().toISOString();
        try{
        let newRawGame = await new RawGame( {data:rawLogData, timestamp} ).save(); //immediately save the game before anything else
        console.log('RawGame saved with ID:', newRawGame._id);
        console.log('local_slot:', game.local_slot);
        let newGame = await new Game({...game, raw_gameID:newRawGame._id }).save();
        console.log('Game saved with ID:', newGame._id);
        let localPlayerIdentity = _.find(game.game_end.PlayerIdentities, (playerIdentity=>playerIdentity.Slot==game.local_slot));
        let localPlayer = await this.getOrCreatePlayer(localPlayerIdentity.Steamid, localPlayerIdentity.Nickname);
        console.log('localPlayer ID:', localPlayer._id);
        let user = await this.getOrCreateUser(UUID, localPlayer._id);
        let allPlayers = await Promise.all(_.map(game.game_end.PlayerIdentities, async (value, key)=>await this.getOrCreatePlayer(value.Steamid, value.Nickname)));
        await Promise.all( allPlayers.map(otherPlayer=>Player.updateOne({_id:otherPlayer._id}, {$push:{gameIDs:newGame._id, raw_gameIDs:newRawGame._id}})) );
        console.log(`[LOG] Game information successfully sent (${UUID} - ${newGame._id}).`);
        let verified = this.verifyUpload(newGame.toObject(), game);
        if(verified.equivalent)
          console.log("[LOG]", 'Verified integrity of game data.');
        else{
          console.log('\n*************************************** REPORT THIS ***************************************');
          console.log('Game data integrity check failed. This is most likely due to a new game update.');
          console.log('Please copy paste everything in this box and send it to the developer: https://discord.gg/wDjxM2u');
          console.log(verified.missing);
          console.log('*********************************************************************************************\n');
        }
      }catch(err){ console.log('****************** ERROR WHILE SAVING GAME REPORT THIS ****************'); console.log(err); }
      });
    }

    getStandardTournaments() {
      return StandardTournament.find({});
    }
    getGames(query) {
      return Game.find(query);
    }
    getGame(query) {
      return Game.findOne(query);
    }
    getRawGame(query) {
      return RawGame.findOne(query);
    }
    logTournamentGame(tournamentID, dayIndex, heatIndex, gameIndex){
      throw Error('sdffvdfds');
    }
    async test(){
      let test = new StandardTournament(
        {
          name:'CV 2020 Invitational',
          created: moment('08-05-2020', 'DD-MM-YYYY').toDate(),
          roster: 
          [ 
            { playerID: (await this.getOrCreatePlayer('76561198814206069', 'joshua.cunningham'))._id }, //0
            { playerID: (await this.getOrCreatePlayer('76561198027955330', 'Kain42link42'))._id }, //1
            { playerID: (await this.getOrCreatePlayer('76561198073023481', '2JZ 4U'))._id }, //2
            { playerID: (await this.getOrCreatePlayer('76561198153071747', 'arsynal'))._id }, //3
            { playerID: (await this.getOrCreatePlayer('76561198204964299', 'Plimpton'))._id }, //4
            { playerID: (await this.getOrCreatePlayer('76561197998392766', 'Little Dog'))._id }, //5
            { playerID: (await this.getOrCreatePlayer('76561198068394804', 'blueicyflame'))._id }, //6
            { playerID: (await this.getOrCreatePlayer('76561198354769854', 'russandra228'))._id }, //7
            { playerID: (await this.getOrCreatePlayer('76561198189712506', 'Philliedips'))._id }, //8
            { playerID: (await this.getOrCreatePlayer('76561198207913199', 'LK'))._id }, //9
            { playerID: (await this.getOrCreatePlayer('76561198799350618', 'naseem_1378'))._id }, //10
            { playerID: (await this.getOrCreatePlayer('76561198236702268', 'Paceswifty'))._id }, //11
            { playerID: (await this.getOrCreatePlayer('76561198358260106', 'AustinTheSlow'))._id }, //12
            { playerID: (await this.getOrCreatePlayer('76561198037188073', 'Kira110'))._id }, //13
            { playerID: (await this.getOrCreatePlayer('76561199012217952', 'Jemma'))._id }, //14
          ],
          backup_roster:
          [
            { playerID: (await this.getOrCreatePlayer('steamID_bkp_0', 'ukplug01'))._id }
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
                      scheduled: new Date('2020-05-10T21:30:00-0400') 
                      //TODO: Missing gameID
                    }
                  ] 
                },
                { //heat 2
                  games: 
                  [ 
                    { player_roster_indexes: [12, 7, 5, 2, 13], 
                      scheduled: new Date('2020-05-10T20:00:00-0400'),
                      gameID: '5eb8c72332dac83e808f4c6f'
                    }, 
                    { player_roster_indexes: [12, 7, 5, 2, 13], 
                      scheduled: new Date('2020-05-10T20:45:00-0400'),
                      gameID: '5eb8c90632dac83e808f4d85'
                    }, 
                    { player_roster_indexes: [12, 7, 5, 2, 13], 
                      scheduled: new Date('2020-05-10T21:30:00-0400'),
                      gameID: '5eb8d94d04515830c49cd02c'
                    }
                  ] 
                },
                { //heat 3
                  games: 
                  [ 
                    { player_roster_indexes: [11, 3, 0, 10, 9], 
                      scheduled: new Date('2020-05-11T00:00:00-0400') 
                    }, 
                    { player_roster_indexes: [11, 3, 0, 10, 9], 
                      scheduled: new Date('2020-05-11T00:45:00-0400') 
                    }, 
                    { player_roster_indexes: [11, 3, 0, 10, 9], 
                      scheduled: new Date('2020-05-11T01:30:00-0400') 
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
                      scheduled: new Date('2020-05-12T00:00:00-0400') 
                    }, 
                    { player_roster_indexes: [1, 13, 3, 9, 14], 
                      scheduled: new Date('2020-05-12T00:45:00-0400') 
                    }, 
                    { player_roster_indexes: [1, 13, 3, 9, 14],
                      scheduled: new Date('2020-05-12T01:30:00-0400') 
                    }
                  ] 
                },
                { //heat 2
                  games: 
                  [ 
                    { player_roster_indexes: [2, 12, 7, 4, 6],
                      scheduled: new Date('2020-05-11T20:00:00-0400') 
                    }, 
                    { player_roster_indexes: [2, 12, 7, 4, 6],
                      scheduled: new Date('2020-05-11T20:45:00-0400') 
                    }, 
                    { player_roster_indexes: [2, 12, 7, 4, 6], 
                      scheduled: new Date('2020-05-11T21:30:00-0400') 
                    }
                  ] 
                },
                { //heat 3
                  games: 
                  [ 
                    { player_roster_indexes: [11 ,5, 0, 8, 10], 
                      scheduled: new Date('2020-05-12T00:00:00-0400') 
                    }, 
                    { player_roster_indexes: [11 ,5, 0, 8, 10], 
                      scheduled: new Date('2020-05-12T00:45:00-0400') 
                    }, 
                    { player_roster_indexes: [11 ,5, 0, 8, 10], 
                      scheduled: new Date('2020-05-12T01:30:00-0400') 
                    }
                  ] 
                }
              ]
            },
            { //day 3
              date: moment('12-05-2020', 'DD-MM-YYYY').toDate(),
            },
            { //day 4
              date: moment('13-05-2020', 'DD-MM-YYYY').toDate(),
            },
            { //day 5
              date: moment('17-05-2020', 'DD-MM-YYYY').toDate(),
            },
            
          ]
        });
      test.save().then(result=>console.log('saved tourny', result));
    }
}

module.exports = {
    Database
}