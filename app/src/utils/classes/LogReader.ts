import os from 'os';
import fs from 'fs';
import EventEmitter from 'events';
import { GameMap, GameMode, NamingConvention, NodeNumber, NumberOfPlayers, PlayerRole, PlayerSlot } from '@/types/game';
import { PlayerIdentity, Role } from '@prisma/client';
import FileTail from './FileTail';
import { ColorCode } from '../constants/colors';
import { logLineToISOTime } from '../functions/game';

export type LogSendEvents = {
  //GENERAL
  PlayerInfo: [{"Type":601,"Nickname":string,"Steamid":string}, Date], //Initial identity on steam ticket consumption
  AuthorizationRequest: [{"Type":801,"SteamTicket":string,"ClientToken":string}, Date], //steam authorization
  GlobalChatHistoryRequest: [{Type:903},Date],
  RequestLeaderboard: [{"Type":617,"BoardType":1}, Date],
  FindGame: [{"Type":101,"LevelGroup":number,"RandomSkin":boolean}, Date],
  Vote: [{"Type":309,"Action":number}, Date],
  JoinGame: [{"Type":502,"ID":string}, Date],
  RandomSkin: [{"Type":623,"RandomSkin":boolean}, Date],
  //GAME
  SendTyping: [{"Type":404,"Typing":boolean}, Date], //TODO
  SendChat: [{"Type":204,"Message":string}, Date], //TODO
}

export type LogReceiveEvents = {
  //GENERAL
  GameLaunch: [Date],
  GameClose: [Date],
  AuthResponse: [{"Type":802}, Date],
  PlayerStats: [{"Type":602,"Stats":{"TimePlayed":number,"Credits":number,"Level":number,"MaxLevel":number,"EXP":number,"MaxEXP":number,"GamesPlayedHacker":number,"GamesPlayedAgent":number,"GamesWonHacker":number,"GamesWonAgent":number,"GamesLostHacker":number,"GamesLostAgent":number,"WordsWritten":number,"BadWordsWritten":number,"CurrentWinStreak":number,"BestWinStreak":number,"MaxAchievements":number,"MaxSkins":number,"MaxEmojis":number,"MaxGestures":number,"ClaimedItems":string[],"ClaimedAchievements":string[],"CurrentSkin":string,"RandomNamePreference":number,"AccountRoles":number[],"Muted":number,"LongestGame":number,"ShortestGame":number,"CustomGamesPlayed":number,"CreditsObtained":string,"PlayersReported":number,"ReportsReceived":number,"LeavePenalties":number,"BansReceived":number,"BanAppreciation":false,"ItemOfTheWeek":number,"ItemOfTheWeekTimeLeft":number,"ItemOfTheWeekSKU":number}}, Date],
  ServerInfo: [{"Type":2,"PlayersOnline":number,"PlayersPlaying":number,"PublicCustomGames"?:number,"PlayersSearching":number,"MaintenanceIn"?:number}, Date],
  GlobalChatHistoryResponse: [{"Type":904,"Messages":{"Message":string,"SteamId":string,"Username":string,"Roles":number[],"Timestamp":number}[]}, Date]
  SendGlobalChatMessage: [{Type:901, Message:string}, Date],
  ReceiveGlobalChatMessage: [{"Type":902,"Message":{"Message":string,"SteamId":string,"Username":string,"Roles":number[],"Timestamp":number}}, Date],
  LeaderBoard: [{"Type":618, Entries:{"Rank":number,"User":string,"Level":number,"PlayTime":number,"Wins":number,"Losses":number,"WLRate":string}[], "SelfEntry":{"Rank":number,"User":string,"Level":number,"PlayTime":number,"Wins":number,"Losses":number,"WLRate":string}}, Date]
  RoomInfo: [{"Type":103,"PlayersCount":NumberOfPlayers,"MaxPlayers":NumberOfPlayers,"AcceptedPlayers":NumberOfPlayers,"StartIn":number/*-1 = tbd*/}, Date],
  PublicLobbyList: [{ "Type":552,"Lobbies":{"Id":string,"HostName":string,"Players":NumberOfPlayers,"Voice":boolean,"Options":{"GameMode":GameMode,"MaxPlayers":NumberOfPlayers,"Visibility":number,"NamingConvention":NamingConvention,"HammerEnabled":boolean,"SkipTalkingPhaseEnabled":boolean,"MapPickOption":GameMap,"Maps":GameMap[]}}[] }, Date],
  KeepAlive: [{Type:-1}, Date], //send
  //GAME
  ChatMessageReceive: [{"Type":205,"Message":string,"Slot":PlayerSlot}, Date],
  GameFound: [{"Type":102,"PlayerNumber":NumberOfPlayers,"Hacker":boolean,"GuyRole":PlayerRole,"HackersAmount":number,"MissionInfo":NumberOfPlayers[],"MissionMinhacks":number[],"Hackers":[],"MatchType":GameMode,"FirstPlayer":PlayerSlot,"Map":GameMap,"Options":{"GameMode":GameMode,"MaxPlayers":NumberOfPlayers,"Visibility":number,"NamingConvention":NamingConvention,"HammerEnabled":boolean,"SkipTalkingPhaseEnabled":boolean,"MapPickOption":GameMap/* ? */,"Maps":GameMap[]},"VoiceChat":boolean,"VoiceChatName":string,"VoiceChatChannel":string}, Date],
  CancelSearch: [{"Type":104}, Date],
  SpawnPlayer: [{"Type":202,"Slot":PlayerSlot,"Color":ColorCode,"Username":string,"Female":boolean,"IsLocal":boolean,"Skin":string}, Date],
  GameStart: [{"Type":201,"Disconnected":PlayerSlot[],"AFK":PlayerSlot[]}, Date],
  SelectPhaseStart: [{"Type":303,"Player":PlayerSlot,"NextPlayer":PlayerSlot,"Amount":number,"Duration":number/*ms*/,"Mission":NodeNumber}, Date], //TODO
  SelectUpdate: [{"Type":305,"Slots":PlayerSlot[],"Submit":boolean,"Pass":boolean}, Date], //TODO
  SelectPhaseEnd: [{"Type":304,"Proposer":PlayerSlot,"SelectedTeam":PlayerSlot[],"Passed":boolean}, Date],
  VotePhaseStart: [{"Type":306,"Proposer":PlayerSlot,"Players":PlayerSlot[],"Duration":number/*ms*/}, Date],
  VoteMade: [{"Type":309,"Slot":PlayerSlot}, Date], //receiving
  VotePhaseEnd: [{"Type":307,"VotesFor":PlayerSlot[],"VotesAgainst":PlayerSlot[],"Passed":boolean}, Date],
  MissionPhaseStart: [{"Type":310,"Mission":NodeNumber,"Players":PlayerSlot[],"Duration":number/*ms*/}, Date],
  MissionPhaseEnd: [{"Type":311,"Mission":NodeNumber,"Failed":boolean,"NumHacks":number,"Proposer":PlayerSlot}, Date],
  IdleStatusUpdate: [{"Type":403,"Idle":boolean,"Player":PlayerSlot}, Date]
  GameEnd: [{"Type":203,"Hacked":boolean,"Hackers":PlayerSlot[],"Canceled":boolean,"Roles":Role[],"Timeout":number/*ms*/,"PlayerIdentities":PlayerIdentity[],"AfterGameLobby":string}, Date]
}

export type LogEvents = LogSendEvents & LogReceiveEvents;

/**
 * Subscribes to log based on platform and emits events
 */
class LogReader extends EventEmitter<LogEvents>{
  private filepath = '';
  constructor(){
    super();
    let platform = os.platform();
    let osRelease = os.release();
    switch(platform){
      case 'linux': {
        osRelease = fs.readFileSync('/etc/os-release', 'utf8');
        if(osRelease.toLowerCase().includes('ubuntu'))
          this.filepath = `${process.env.HOME}/snap/steam/common/.config/unity3d/Nomoon/Mindnight/Player.log`;
      } break;
      case 'win32': {
        this.filepath = `${process.env.USERPROFILE}/appdata/LocalLow/Nomoon/Mindnight/Player.log`;
      } break;
    }
    if(!this.filepath)
      throw Error(`Sorry, Mind Knight does not yet support your platform: ${platform} ${osRelease}`);
    new FileTail(this.filepath, {})
      .addListener((line)=>{
        try{
          if(!line.trim())
            return;
          if(line.includes('Initialize engine version'))
            this.emit('GameLaunch', logLineToISOTime(line));
          else if(line.includes('GlobalChatHisotryRequest')){ //cmon marcel, why u gotta make my life hard. lol
            console.log('FOUND PACKET', 'GlobalChatHisotryRequest');
            console.log('\t', JSON.parse(line.substring(line.toLowerCase().indexOf('packet:', 20) + 7)));
            this.emit('GlobalChatHistoryRequest', JSON.parse(line.substring(line.toLowerCase().indexOf('packet:', 20) + 7)), logLineToISOTime(line));
          }
          else if(line.includes('Connection was closed'))
            this.emit('GameClose', logLineToISOTime(line))
          else { //check for `Received .* packet:` pattern.
            let packetType = /Received (.*) packet:/i.exec(line)?.[1].trim() as keyof LogEvents | undefined; //catch all Received packets
            if(!packetType)
              packetType = /Sending (.*)Packet:/i.exec(line)?.[1].trim() as keyof LogEvents | undefined; //catch all Sending packets
            if(packetType){
              // if((['ReceiveGlobalChatMessage', 'PlayerInfo', 'AuthResponse']).includes(packetType))
              console.log(`FOUND PACKET`, packetType)
              let packet = JSON.parse(line.substring(line.toLowerCase().indexOf('packet:', 20) + 7).trim());// as LogEvents[keyof LogEvents]['0'];
              if((['ReceiveGlobalChatMessage', 'PlayerInfo', 'AuthResponse', 'GameEnd', 'SpawnPlayer']).includes(packetType))
                console.log('\t', packet);
              this.emit(packetType, packet, logLineToISOTime(line));
            }
          }
        } catch(err){
          if(err instanceof SyntaxError){
            console.log('ERROR parsing JSON.')
            console.log('\tLine:', line);
          }
          throw err;
        }
      })
      .start();
  }
  readLog(){
    return fs.readFileSync(this.filepath, 'utf8');
  }
  // emit(type: keyof LogSendEvents | keyof LogReceiveEvents, ...args: any[]): boolean {
  //   super.emit('*', type, ...args);
  //   return super.emit(type, ...args) || super.emit('', ...args);
  // }
  // onAny(listener:(eventName?:keyof LogEvents, ...args: any[]) => void ){
  //   console.log('evt names', this.emit);
  //   this.eventNames().forEach(eventName=>{
  //     this.on(eventName, (...args:any[])=>listener(eventName, ...args));
  //   })
  // }
}

export default new LogReader();