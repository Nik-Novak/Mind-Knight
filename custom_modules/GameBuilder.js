const EventEmitter = require( 'events' );
const _ = require('lodash');

class GameBuilder extends EventEmitter {
    constructor(){
        super();
        this.game = {};
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

    process(line) {
        //RECOGNIZE MINDNIGHT HAS BOOTED
        if(line.includes('Initialize engine version')){
            this.emit('game_launch', this.game);
        }
        else if (line.includes('Sending PlayerInfoPacket')) { //pre menu identity
          let packet = JSON.parse(line.substring(line.indexOf('Packet:', 20) + 7));
          this.emit('game_player_info', packet);
        }
        else if (line.includes('Received GlobalChatHistoryResponse')) {
            this.game={};
            this.emit('game_menu', this.game);
        }
        //RECOGNIZE MINDNIGHT CLOSED
        else if (line.includes('Connection was closed')) {
            this.emit('game_close', this.game);
        }

        //SEQUENTIAL BUILD GAME OBJECT
        else if (line.includes('Received GameFound')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.game.game_found = packet;
        }
        else if (line.includes('Received SpawnPlayer')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            if(packet.IsLocal)
                this.game.local_slot = packet.Slot;
            this.game.players = this.game.players || {}; //INIT
            this.game.players[packet.Slot] = packet;
        }
        else if (line.includes('Received GameStart')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.game.game_start = packet;
            this.propNumber = 1;
            this.emit('game_start', this.game);
        }
        else if (line.includes('Received ChatMessageReceive')) {
            // console.log(line.substring(line.indexOf('packet:', 20) + 7));
            let packet;
            try{
              packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            }catch(err){ console.log('[ERROR] Error while parsing chat message. This is likely due to an offending character. Omitting this message.\n  Offending Message:',line,'\n',err); return; }
            this.game.chat= this.game.chat || [];
            packet.index=this.game.chat.length;
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.game.chat.push(packet);
            this.game.players[packet.Slot].chat = this.game.players[packet.Slot].chat || [];
            this.game.players[packet.Slot].chat.push(packet.index);
            this.emit('game_chatUpdate', this.game);
        }
        else if (line.includes('Received SelectPhaseStart')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.game.players[packet.Player].proposals = this.game.players[packet.Player].proposals || {}; //INIT
            this.game.players[packet.Player].proposals[packet.Mission] = this.game.players[packet.Player].proposals[packet.Mission] || []; //INIT
            packet.propNumber = this.propNumber;
            this.game.players[packet.Player].proposals[packet.Mission].push(packet);
            this.missionNum = packet.Mission;
        }
        else if (line.includes('Received SelectPhaseEnd')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            let missionProps = this.game.players[packet.Proposer].proposals[this.missionNum];
            packet.deltaT = packet.timestamp - this.game.players[packet.Proposer].proposals[this.missionNum][this.game.players[packet.Proposer].proposals[this.missionNum].length-1].timestamp;
            this.game.chat= this.game.chat || [];
            packet.chatIndex = this.game.chat.length;
            this.game.players[packet.Proposer].proposals[this.missionNum][missionProps.length-1] = Object.assign(this.game.players[packet.Proposer].proposals[this.missionNum][missionProps.length-1], packet);
            this.emit('game_selectPhaseEnd', this.game);
        }
        else if (line.includes('Received VotePhaseStart')) { //passed flag is set if the vote succeeded
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.proposerNum = packet.Proposer;
            let missionProps = this.game.players[packet.Proposer].proposals[this.missionNum];
            this.game.players[packet.Proposer].proposals[this.missionNum][missionProps.length-1].vote_phase_start = packet;
        }
        else if (line.includes('Received VoteMade')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            let missionProps = this.game.players[this.proposerNum].proposals[this.missionNum];
            packet.deltaT = packet.timestamp - this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_phase_start.timestamp;
            this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_made = this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_made || {}; //INIT
            this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_made[packet.Slot] = packet;
        }
        else if (line.includes('Received VotePhaseEnd')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            let missionProps = this.game.players[this.proposerNum].proposals[this.missionNum];
            packet.deltaT = packet.timestamp - this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_phase_start.timestamp;
            packet.chatIndex = this.game.chat.length;
            this.game.players[this.proposerNum].proposals[this.missionNum][missionProps.length-1].vote_phase_end = packet;
            this.propNumber++;
            this.emit('game_votePhaseEnd', this.game);
        }
        else if (line.includes('Received MissionPhaseStart')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.game.missions = this.game.missions || {}; //INIT
            this.game.missions[packet.Mission] = this.game.missions[packet.Mission] || {}; //INIT
            this.game.missions[packet.Mission].mission_phase_start = packet;
        }
        else if (line.includes('Received MissionPhaseEnd')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            packet.deltaT = packet.timestamp - this.game.missions[packet.Mission].mission_phase_start.timestamp;
            packet.propNumber = this.propNumber-1;
            packet.chatIndex = this.game.chat.length;
            this.propNumber=1;
            this.game.missions[packet.Mission].mission_phase_end = packet;
            this.emit('game_missionPhaseEnd', this.game);
        }
        else if (line.includes('Received GameEnd')) {
            console.log('Game End');
            // console.log(line.substring(line.indexOf('packet:', 20) + 7));
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = this.getISOTimestamp(line.substring(0, 19));
            this.game.game_end = packet;
            this.emit('game_end', this.game);
        }
    }

    buildGamesFromLog(log, startIndex=0){
      let games = [];
      this.on('game_missionPhaseEnd',(game)=>{
        games.push(game);
      });
      let rawGameStart = log.substring(startIndex);
      rawGameStart.split('\n').forEach(line=>this.process(line));
      return games;
    }
}
module.exports=GameBuilder;