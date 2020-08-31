//@ts-check
var fs = require('fs-extra');
var os = require('os');
const _ = require('lodash');
const moment = require('moment');
const config = require('config');

const {
    execSync
} = require('child_process');

const mongoose = require('../models').mongoose;
const { Game, RawGame } = require('../models/Game');
const { User } = require('../models/User');
const { Player } = require('../models/Player');
const { StandardTournament } = require('../models/Tournament');

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
          { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify:false }
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
      this.uploadGameData(UUID, deepCopyGame, { rawLogData });
    }
    
    resetCheckpoint(checkpointIndex=0){
      this.fileCheckpoint=checkpointIndex;
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

    async login(steamID=undefined, name=undefined){
      if(steamID){ //conventional login
        let player = await this.getOrCreatePlayer(steamID, name);
        let UUID = this.getID();
        let user;
        if(player)
          user = await this.getOrCreateUser(UUID, player._id);
        if (user && player)
          return {user, player};
      }
      let user = await this.getOrCreateUser(this.getID()); //last ditch attempt to login via ID
      if(user){
        // @ts-ignore
        let player = await Player.findOne({_id:user.playerID});
        if(player)
          return { user, player };
      }
      throw Error('Unable to login and insufficient knowledge to create an account. Try running the client, then opening mindnight to fix this.')
    }

    getID() {
      if(this.UUID) //if we've already retrieved it
        return this.UUID
      let stdout = execSync(config.get('external_commands.getID'));
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
      if(name && player.name.toString()!=name.toString()){
        console.log('Player to name mismatch, updating name to:', name);
        Player.findOneAndUpdate( {_id:player._id}, {name}, {new: true, runValidators: true, strict:false} )
              .then(updatedPlayer=>console.log('UPDATED player.name:', updatedPlayer && updatedPlayer.name))
              .catch(err=>console.log('Error updating player name: \n', err));
        // Player.update({_id:player._id}, {name}); //wasn't updating, needed $set property which I dont like
        // @ts-ignore
        player.name = name;
      }
      return player;
    }

    async getOrCreateUser(UUID, playerID){
      let user = await User.findOne({UUID});
        if(!user)
          user = await new User({UUID, playerID}).save();
        // @ts-ignore
        if(playerID && user.playerID.toString() != playerID.toString()){
          console.log('User to Player mismatch, updating playerID to:', playerID.toString());
          console.log(user.playerID.toString(), playerID.toString());
          User.findOneAndUpdate( {_id:user._id}, {playerID}, {new: true, runValidators: true, strict:false} )
              .then(updatedUser=>console.log('UPDATED user.playerID:', updatedUser && updatedUser.playerID))
              .catch(err=>console.log('Error updating user playerID: \n', err));
          // User.update({_id:user._id}, {playerID}); 
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

    uploadGameData(UUID, game, {rawGameID=undefined, rawLogData=undefined}) {
      this.database.then(async connection=>{
        let timestamp = new Date().toISOString();
        try{
        let rawGame;
        if(rawLogData!=undefined)
          rawGame = await new RawGame( {data:rawLogData, timestamp} ).save(); //immediately save the game before anything else
        else if(rawGameID!=undefined)
          rawGame = await this.getRawGame({_id:rawGameID});
        else
          console.log('Neither raw data nor id was provided');
        console.log('RawGame with ID:', rawGame._id);
        console.log('local_slot:', game.local_slot);
        let newGame = await new Game({...game, raw_gameID:rawGame._id }).save();
        console.log('Game saved with ID:', newGame._id);
        let localPlayerIdentity = _.find(game.game_end.PlayerIdentities, (playerIdentity=>playerIdentity.Slot==game.local_slot));
        let localPlayer = await this.getOrCreatePlayer(localPlayerIdentity.Steamid, localPlayerIdentity.Nickname);
        console.log('localPlayer ID:', localPlayer._id);
        let user = await this.getOrCreateUser(UUID, localPlayer._id);
        console.log('user ID:', user._id);
        let allPlayers = await Promise.all(_.map(game.game_end.PlayerIdentities, async (value, key)=>await this.getOrCreatePlayer(value.Steamid, value.Nickname)));
        await Promise.all( allPlayers.map(otherPlayer=>Player.updateOne({_id:otherPlayer._id}, {$push:{gameIDs:newGame._id, raw_gameIDs:rawGame._id}})) );
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
      }catch(err){ console.log('****************** ERROR WHILE SAVING GAME, REPORT THIS ****************'); console.log(err); }
      });
    }

    getStandardTournament(query) {
      return StandardTournament.findOne(query);
    }
    getStandardTournaments(query) {
      return StandardTournament.find(query);
    }
    getGame(query) {
      return Game.findOne(query);
    }
    getGames(query) {
      return Game.find(query);
    }
    getRawGame(query) {
      return RawGame.findOne(query);
    }
    logTournamentGame(tournamentID, dayIndex, heatIndex, gameIndex){
      throw Error('sdffvdfds');
    }

    async addStandardTournament(standardTournament){
      let tournament = new StandardTournament(standardTournament);
      return tournament.save();
    }
}

module.exports = {
    Database
}