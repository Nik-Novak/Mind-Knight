const EventEmitter = require( 'events' );
const _ = require('lodash');
const os = require('os');

class GameBuilder extends EventEmitter {
  constructor(){
    super();
    this.game = {};
    this.gameInProgress = false;
    this.missionNum;
    this.proposerNum;
    this.propNumber;
  }

  getGame(){
    return this.game;
  }

  getISOTimestamp(lineTimestamp){
    let tmpTimestamp = lineTimestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
    return new Date(tmpTimestamp);
  }

  static shouldEmit(event, whitelistedEmits, blacklistedEmits){
    if(whitelistedEmits && Array.isArray(whitelistedEmits))
      return whitelistedEmits.includes(event);
    if(blacklistedEmits && Array.isArray(blacklistedEmits))
      return !blacklistedEmits.includes(event);
    return true;
  }

  process = (line, {whitelistedEmits=null, blacklistedEmits=null}={} ) => {
    //RECOGNIZE MINDNIGHT HAS BOOTED
    if(line.includes('Initialize engine version')){
      let event = 'game_launch'
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Sending PlayerInfoPacket')) { //pre menu identity
      let event = 'game_player_info';
      let packet = JSON.parse(line.substring(line.indexOf('Packet:', 20) + 7));
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, packet);
    }
    else if (line.includes('Received GlobalChatHistoryResponse')) {
      let event = 'game_menu'
      if(!this.gameInProgress)
        this.game={};
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    //RECOGNIZE MINDNIGHT CLOSED
    else if (line.includes('Connection was closed')) {
      let event = 'game_close';
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }

    //SEQUENTIAL BUILD GAME OBJECT
    else if (line.includes('Received GameFound')) {
      let event = 'game_found';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.game.game_found = packet;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received SpawnPlayer')) {
      let event = 'game_spawnPlayer'
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      if(packet.IsLocal)
          this.game.local_slot = packet.Slot;
      this.game.players = this.game.players || {}; //INIT
      this.game.players[packet.Slot] = packet;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received GameStart')) {
      let event = 'game_start';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.game.game_start = packet;
      this.propNumber = 1;
      this.gameInProgress=true;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received ChatMessageReceive')) {
      // console.log(line.substring(line.indexOf('packet:', 20) + 7));
      let event = 'game_chatUpdate';
      let packet;
      try{
        packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      }catch(err){ 
        let error ='[ERROR] Error while parsing chat message. This is likely due to an offending character. Omitting this message.\n  Offending Message:'+line+'\n'+err; 
        console.log(error); 
        this.emit('error', error); 
      }
      if(!packet)
        return;
      if(!this.game.players){
        console.log(`A chat message was found for slot: ${packet.Slot} but the players object was null or undefined. Message will be discarded.`);
        return;
      }
      this.game.chat= this.game.chat || [];
      packet.index=this.game.chat.length;
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.game.chat.push(packet);
      this.game.players[packet.Slot].chat = this.game.players[packet.Slot].chat || [];
      this.game.players[packet.Slot].chat.push(packet.index);
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received SelectPhaseStart')) {
      let event = 'game_selectPhaseStart';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.game.players[packet.Player].proposals = this.game.players[packet.Player].proposals || {}; //INIT
      this.game.players[packet.Player].proposals[packet.Mission] = this.game.players[packet.Player].proposals[packet.Mission] || []; //INIT
      packet.propNumber = this.propNumber;
      this.game.players[packet.Player].proposals[packet.Mission].push(packet);
      this.missionNum = packet.Mission;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received SelectPhaseEnd')) { //pass occurs if passed flag is set to true here
      let event = 'game_selectPhaseEnd';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      let missionProps = this.game.players[packet.Proposer].proposals[this.missionNum];
      packet.deltaT = packet.timestamp - this.game.players[packet.Proposer].proposals[this.missionNum][this.game.players[packet.Proposer].proposals[this.missionNum].length-1].timestamp;
      this.game.chat= this.game.chat || [];
      packet.chatIndex = this.game.chat.length;
      this.game.players[packet.Proposer].proposals[this.missionNum][missionProps.length-1] = Object.assign(this.game.players[packet.Proposer].proposals[this.missionNum][missionProps.length-1], packet);
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received VotePhaseStart')) { //passed flag is set if the vote succeeded
      let event = 'game_votePhaseStart';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.proposerNum = packet.Proposer;
      let missionProps = this.game.players[packet.Proposer].proposals[this.missionNum];
      this.game.players[packet.Proposer].proposals[this.missionNum][missionProps.length-1].vote_phase_start = packet;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received VoteMade')) {
      let event = 'game_voteMade';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      let missionProps = this.game.players[this.proposerNum].proposals[this.missionNum];
      packet.deltaT = packet.timestamp - this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_phase_start.timestamp;
      this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_made = this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_made || {}; //INIT
      this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_made[packet.Slot] = packet;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received VotePhaseEnd')) { //pass occurs if passed flag is set to true here
      let event = 'game_votePhaseEnd';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      let missionProps = this.game.players[this.proposerNum].proposals[this.missionNum];
      packet.deltaT = packet.timestamp - this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_phase_start.timestamp;
      packet.chatIndex = this.game.chat.length;
      this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_phase_end = packet;
      this.propNumber++;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received MissionPhaseStart')) { //pass occurs if passed flag is set to true here
      let event = 'game_missionPhaseStart';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.game.missions = this.game.missions || {}; //INIT
      this.game.missions[packet.Mission] = this.game.missions[packet.Mission] || {}; //INIT
      this.game.missions[packet.Mission].mission_phase_start = packet;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received MissionPhaseEnd')) { //pass occurs if passed flag is set to true here
      let event = 'game_missionPhaseEnd';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      packet.deltaT = packet.timestamp - this.game.missions[packet.Mission].mission_phase_start.timestamp;
      packet.propNumber = this.propNumber-1;
      packet.chatIndex = this.game.chat.length;
      this.propNumber=1;
      this.game.missions[packet.Mission].mission_phase_end = packet;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
    else if (line.includes('Received GameEnd')) {
      let event = 'game_end';
      let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
      packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
      this.game.game_end = packet;
      this.gameInProgress=true;
      if(GameBuilder.shouldEmit(event, whitelistedEmits, blacklistedEmits))
        this.emit(event, this.game);
    }
  }

  buildGamesFromLog(log, startIndex=0){
    let games = [];
    this.on('game_missionPhaseEnd',(game)=>{
      games.push(game);
    });
    let rawGameStart = startIndex==0? log : log.substring(startIndex);
    rawGameStart.split(os.EOL).forEach(line=>this.process(line));
    return games;
  }

  resumeFromLog(log, startIndex=0, {whitelistedEmits=null, blacklistedEmits=null}={} ){
    let rawGameStart = startIndex==0? log : log.substring(startIndex);
    rawGameStart.split(os.EOL).forEach(line=>this.process(line,{whitelistedEmits, blacklistedEmits}));
  }
}
module.exports=GameBuilder;