const EventEmitter = require( 'events' );

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

    process(line, socket) {
        //RECOGNIZE MINDNIGHT HAS BOOTED
        if(line.includes('Initialize engine version')){
            this.emit('game_launch', this.game);
        }
        else if (line.includes('Received GlobalChatHistoryResponse')) {
            this.game={};
            this.emit('game_menu', this.game);
        }
        //RECOGNIZE MINDNIGHT CLOSED
        else if (line.includes('Connection was closed')) {
            this.emit('game_close', this.game);
        }

        else if (line.includes('Received ChatMessageReceive')) {
            // console.log(line.substring(line.indexOf('packet:', 20) + 7));
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            this.game.chat= this.game.chat || [];
            packet.id=this.game.chat.length;
            this.game.chat.push(packet);
            this.game.players[packet.Slot].chat = this.game.players[packet.Slot].chat || [];
            this.game.players[packet.Slot].chat.push(packet.id);
            this.emit('game_chatUpdate', this.game);
        }

        //SEQUENTIAL BUILD GAME OBJECT
        else if (line.includes('Received GameFound')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            this.game.game_found = packet;
        }
        else if (line.includes('Received SpawnPlayer')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            this.game.players = this.game.players || {}; //INIT
            this.game.players[packet.Slot] = packet;
        }
        else if (line.includes('Received GameStart')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            this.game.disconnected = packet.Disconnected;
            this.game.afk = packet.AFK;
            this.propNumber = 1;
            this.emit('game_start', this.game);
        }
        else if (line.includes('Received SelectPhaseStart')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
            this.game.players[packet.Player].missions = this.game.players[packet.Player].missions || {}; //INIT
            this.game.players[packet.Player].missions[packet.Mission] = this.game.players[packet.Player].missions[packet.Mission] || []; //INIT
            packet.propNumber = this.propNumber;
            this.game.players[packet.Player].missions[packet.Mission].push(packet);
            this.missionNum = packet.Mission;
        }
        else if (line.includes('Received SelectPhaseEnd')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
            let missionProps = this.game.players[packet.Proposer].missions[this.missionNum];
            packet.deltaT = packet.timestamp - this.game.players[packet.Proposer].missions[this.missionNum][this.game.players[packet.Proposer].missions[this.missionNum].length-1].timestamp;
            this.game.chat= this.game.chat || [];
            packet.chatIndex = this.game.chat.length;
            this.game.players[packet.Proposer].missions[this.missionNum][missionProps.length-1] = Object.assign(this.game.players[packet.Proposer].missions[this.missionNum][missionProps.length-1], packet);
            this.emit('game_selectPhaseEnd', this.game);
        }
        else if (line.includes('Received VotePhaseStart')) { //passed flag is set if the vote succeeded
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
            this.proposerNum = packet.Proposer;
            let missionProps = this.game.players[packet.Proposer].missions[this.missionNum];
            this.game.players[packet.Proposer].missions[this.missionNum][missionProps.length-1].vote_phase_start = packet;
        }
        else if (line.includes('Received VoteMade')) {
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
            let missionProps = this.game.players[this.proposerNum].missions[this.missionNum];
            packet.deltaT = packet.timestamp - this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].vote_phase_start.timestamp;
            this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].vote_made = this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].vote_made || {}; //INIT
            this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].vote_made[packet.Slot] = packet;
        }
        else if (line.includes('Received VotePhaseEnd')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
            let missionProps = this.game.players[this.proposerNum].missions[this.missionNum];
            packet.deltaT = packet.timestamp - this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].vote_phase_start.timestamp;
            packet.chatIndex = this.game.chat.length;
            this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].vote_phase_end = packet;
            this.game.players[this.proposerNum].missions[this.missionNum][missionProps.length-1].confirmedPropNumber = this.propNumber;
            this.propNumber++;
            this.emit('game_votePhaseEnd', this.game);
        }
        else if (line.includes('Received MissionPhaseStart')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
            this.game.missions = this.game.missions || {}; //INIT
            this.game.missions[packet.Mission] = this.game.missions[packet.Mission] || {}; //INIT
            this.game.missions[packet.Mission].mission_phase_start = packet;
        }
        else if (line.includes('Received MissionPhaseEnd')) { //pass occurs if passed flag is set to true here
            let packet = JSON.parse(line.substring(line.indexOf('packet:', 20) + 7));
            packet.timestamp = line.substring(0, 19);
            let tmpTimestamp = packet.timestamp.replace(/\./g, '-').replace(' ', 'T') + "Z";
            packet.timestamp = new Date(tmpTimestamp);
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
            this.game.game_end = packet;
            this.emit('game_end', this.game);
        }
    }
}
module.exports=GameBuilder;