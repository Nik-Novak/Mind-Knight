import { ColorCode } from "@/utils/constants/colors"
import { GameMap, GameMode, NamingConvention, NodeNumber, NumberOfPlayers, PlayerRole, PlayerSlot } from "./game"
import { Game, MindnightSession, PlayerIdentity, Role } from "@prisma/client"
export const LogSendEventCodes = {
  PlayerInfo: 601,
  AuthorizationRequest: 801,
  GlobalChatHistoryRequest: 903,
  RequestLeaderboard: 617,
  FindGame: 101,
  Vote: 309,
  JoinGame: 502,
  RandomSkin: 623,
  KeepAlive: -1,
  SendTyping: 404,
  SendChat: 204,
  SendGlobalChatMessage: 901,
  CancelSearch: 104,
  AcceptMatch: 105
} as const;
export type LogSendEventCode = typeof LogSendEventCodes[keyof typeof LogSendEventCodes];
export function getLogSendType(code:LogSendEventCode){
  let eventCodeEntry = Object.entries(LogSendEventCodes).find(([key, val])=>val === code);
  if(!eventCodeEntry)
    throw Error(`Unknown code: ${code}. Does not match any LogSendEventCodes`);
  let type = eventCodeEntry[0] as keyof LogSendEvents;
  return type;
}
export type LogSendEvents = {
  //GENERAL
  PlayerInfo: [{"Type":typeof LogSendEventCodes['PlayerInfo'],"Nickname":string,"Steamid":string}, Date], //Initial identity on steam ticket consumption
  AuthorizationRequest: [{"Type":typeof LogSendEventCodes['AuthorizationRequest'],"SteamTicket":string,"ClientToken":string}, Date], //steam authorization
  GlobalChatHistoryRequest: [{Type:typeof LogSendEventCodes['GlobalChatHistoryRequest']},Date],
  RequestLeaderboard: [{"Type":typeof LogSendEventCodes['RequestLeaderboard'],"BoardType":1}, Date],
  FindGame: [{"Type":typeof LogSendEventCodes['FindGame'],"LevelGroup":number,"RandomSkin":boolean}, Date],
  Vote: [{"Type":typeof LogSendEventCodes['Vote'],"Action":number}, Date],
  JoinGame: [{"Type":typeof LogSendEventCodes['JoinGame'],"ID":string}, Date],
  RandomSkin: [{"Type":typeof LogSendEventCodes['RandomSkin'],"RandomSkin":boolean}, Date],
  KeepAlive: [{"Type":typeof LogSendEventCodes['KeepAlive']}, Date],
  SendGlobalChatMessage: [{Type:typeof LogSendEventCodes['SendGlobalChatMessage'], Message:string}, Date],
  CancelSearch: [{Type:typeof LogSendEventCodes['CancelSearch']}, Date],
  Acceptmatch: [{Type:typeof LogSendEventCodes['AcceptMatch']}, Date],
  //GAME
  SendTyping: [{"Type":typeof LogSendEventCodes['SendTyping'],"Typing":boolean}, Date], //TODO
  SendChat: [{"Type":typeof LogSendEventCodes['SendChat'],"Message":string}, Date], //TODO
}

export const LogReceiveEventCodes = {
  AuthResponse: 802,
  PlayerStats: 602,
  ServerInfo: 2,
  GlobalChatHistoryResponse: 904,
  ReceiveGlobalChatMessage: 902,
  LeaderBoard: 618,
  RoomInfo: 103,
  PublicLobbyList: 552,
  KeepAlive: -1,
  ChatMessageReceive: 205,
  ChatUpdate: 405,
  GameFound: 102,
  CancelSearch: 104,
  SpawnPlayer: 202,
  GameStart: 201,
  SelectPhaseStart: 303,
  SelectUpdate: 305,
  SelectPhaseEnd: 304,
  VotePhaseStart: 306,
  VoteMade: 309,
  VotePhaseEnd: 307,
  MissionPhaseStart: 310,
  MissionPhaseEnd: 311,
  IdleStatusUpdate: 403,
  GameEnd: 203,
  Disconnected: 402,
  Reconnected: 406,
  MatchUpdatePacket: 112
} as const;
export type LogReceiveEventCode = typeof LogReceiveEventCodes[keyof typeof LogReceiveEventCodes];
export function getLogReceiveType(code:LogReceiveEventCode){
  let eventCodeEntry = Object.entries(LogReceiveEventCodes).find(([key, val])=>val === code);
  if(!eventCodeEntry)
    throw Error(`Unknown code: ${code}. Does not match any LogReceiveEventCodes`);
  let type = eventCodeEntry[0] as keyof LogReceiveEvents;
  return type;
}

export type LogReceiveEvents = {
  //GENERAL
  GameLaunch: [Date],
  GameClose: [Date],
  AuthResponse: [{"Type":typeof LogReceiveEventCodes['AuthResponse']}, Date],
  PlayerStats: [{"Type":typeof LogReceiveEventCodes['PlayerStats'],"Stats":{"TimePlayed":number,"Credits":number,"Level":number,"MaxLevel":number,"EXP":number,"MaxEXP":number,"GamesPlayedHacker":number,"GamesPlayedAgent":number,"GamesWonHacker":number,"GamesWonAgent":number,"GamesLostHacker":number,"GamesLostAgent":number,"WordsWritten":number,"BadWordsWritten":number,"CurrentWinStreak":number,"BestWinStreak":number,"MaxAchievements":number,"MaxSkins":number,"MaxEmojis":number,"MaxGestures":number,"ClaimedItems":string[],"ClaimedAchievements":string[],"CurrentSkin":string,"RandomNamePreference":number,"AccountRoles":number[],"Muted":number,"LongestGame":number,"ShortestGame":number,"CustomGamesPlayed":number,"CreditsObtained":string,"PlayersReported":number,"ReportsReceived":number,"LeavePenalties":number,"BansReceived":number,"BanAppreciation":false,"ItemOfTheWeek":number,"ItemOfTheWeekTimeLeft":number,"ItemOfTheWeekSKU":number}}, Date],
  ServerInfo: [{"Type":typeof LogReceiveEventCodes['ServerInfo'],"PlayersOnline":number,"PlayersPlaying":number,"PublicCustomGames"?:number,"PlayersSearching":number,"MaintenanceIn"?:number}, Date],
  GlobalChatHistoryResponse: [{"Type":typeof LogReceiveEventCodes['GlobalChatHistoryResponse'],"Messages":{"Message":string,"SteamId":string,"Username":string,"Roles":number[],"Timestamp":number}[]}, Date]
  ReceiveGlobalChatMessage: [{"Type":typeof LogReceiveEventCodes['ReceiveGlobalChatMessage'],"Message":{"Message":string,"SteamId":string,"Username":string,"Roles":number[],"Timestamp":number}}, Date],
  LeaderBoard: [{"Type":typeof LogReceiveEventCodes['LeaderBoard'], Entries:{"Rank":number,"User":string,"Level":number,"PlayTime":number,"Wins":number,"Losses":number,"WLRate":string}[], "SelfEntry":{"Rank":number,"User":string,"Level":number,"PlayTime":number,"Wins":number,"Losses":number,"WLRate":string}}, Date]
  RoomInfo: [{"Type":typeof LogReceiveEventCodes['RoomInfo'],"PlayersCount":NumberOfPlayers,"MaxPlayers":NumberOfPlayers,"AcceptedPlayers":NumberOfPlayers,"StartIn":number/*-1 = tbd*/}, Date],
  PublicLobbyList: [{ "Type":typeof LogReceiveEventCodes['PublicLobbyList'],"Lobbies":{"Id":string,"HostName":string,"Players":NumberOfPlayers,"Voice":boolean,"Options":{"GameMode":GameMode,"MaxPlayers":NumberOfPlayers,"Visibility":number,"NamingConvention":NamingConvention,"HammerEnabled":boolean,"SkipTalkingPhaseEnabled":boolean,"MapPickOption":GameMap,"Maps":GameMap[]}}[] }, Date],
  KeepAlive: [{Type:typeof LogReceiveEventCodes['KeepAlive']}, Date], //send
  //GAME
  ChatMessageReceive: [{"Type":typeof LogReceiveEventCodes['ChatMessageReceive'],"Message":string,"Slot":PlayerSlot}, Date],
  ChatUpdate: [{"Type":typeof LogReceiveEventCodes['ChatUpdate'],"Slot":PlayerSlot,"Typing":boolean}, Date],
  GameFound: [{"Type":typeof LogReceiveEventCodes['GameFound'],"PlayerNumber":NumberOfPlayers,"Hacker":boolean,"GuyRole":PlayerRole,"HackersAmount":number,"MissionInfo":NumberOfPlayers[],"MissionMinhacks":number[],"Hackers":[],"MatchType":GameMode,"FirstPlayer":PlayerSlot,"Map":GameMap,"Options":{"GameMode":GameMode,"MaxPlayers":NumberOfPlayers,"Visibility":number,"NamingConvention":NamingConvention,"HammerEnabled":boolean,"SkipTalkingPhaseEnabled":boolean,"MapPickOption":GameMap/* ? */,"Maps":GameMap[]},"VoiceChat":boolean,"VoiceChatName":string,"VoiceChatChannel":string}, Date],
  CancelSearch: [{"Type":typeof LogReceiveEventCodes['CancelSearch']}, Date],
  SpawnPlayer: [{"Type":typeof LogReceiveEventCodes['SpawnPlayer'],"Slot":PlayerSlot,"Color":ColorCode,"Username":string,"Female":boolean,"IsLocal":boolean,"Skin":string}, Date],
  GameStart: [{"Type":typeof LogReceiveEventCodes['GameStart'],"Disconnected":PlayerSlot[],"AFK":PlayerSlot[]}, Date],
  SelectPhaseStart: [{"Type":typeof LogReceiveEventCodes['SelectPhaseStart'],"Player":PlayerSlot,"NextPlayer":PlayerSlot,"Amount":number,"Duration":number/*ms*/,"Mission":NodeNumber}, Date], //TODO
  SelectUpdate: [{"Type":typeof LogReceiveEventCodes['SelectUpdate'],"Slots":PlayerSlot[],"Submit":boolean,"Pass":boolean}, Date], //TODO
  SelectPhaseEnd: [{"Type":typeof LogReceiveEventCodes['SelectPhaseEnd'],"Proposer":PlayerSlot,"SelectedTeam":PlayerSlot[],"Passed":boolean}, Date],
  VotePhaseStart: [{"Type":typeof LogReceiveEventCodes['VotePhaseStart'],"Proposer":PlayerSlot,"Players":PlayerSlot[],"Duration":number/*ms*/}, Date],
  VoteMade: [{"Type":typeof LogReceiveEventCodes['VoteMade'],"Slot":PlayerSlot}, Date], //receiving
  VotePhaseEnd: [{"Type":typeof LogReceiveEventCodes['VotePhaseEnd'],"VotesFor":PlayerSlot[],"VotesAgainst":PlayerSlot[],"Passed":boolean}, Date],
  MissionPhaseStart: [{"Type":typeof LogReceiveEventCodes['MissionPhaseStart'],"Mission":NodeNumber,"Players":PlayerSlot[],"Duration":number/*ms*/}, Date],
  MissionPhaseEnd: [{"Type":typeof LogReceiveEventCodes['MissionPhaseEnd'],"Mission":NodeNumber,"Failed":boolean,"NumHacks":number,"Proposer":PlayerSlot}, Date],
  IdleStatusUpdate: [{"Type":typeof LogReceiveEventCodes['IdleStatusUpdate'],"Idle":boolean,"Player":PlayerSlot}, Date]
  GameEnd: [{"Type":typeof LogReceiveEventCodes['GameEnd'],"Hacked":boolean,"Hackers":PlayerSlot[],"Canceled":boolean,"Roles":Role[],"Timeout":number/*ms*/,"PlayerIdentities":PlayerIdentity[],"AfterGameLobby":string}, Date]
  Disconnected: [{"Type":typeof LogReceiveEventCodes['Disconnected'],"Player":PlayerSlot,"ByNetwork":boolean}, Date],
  Reconnected: [{"Type":typeof LogReceiveEventCodes['Reconnected'],"Player":PlayerSlot}, Date],
  MatchUpdatePacket: [{"Type":typeof LogReceiveEventCodes['MatchUpdatePacket'], "Chat":MatchUpdateChat[], "MatchHistorySlots":{ nodes:MatchUpdateNode[], matchState:MatchState }}, Date],
}

enum MatchUpdateChatType {
  Player=0,
  System=1,
}
type MatchUpdateChat = {
  PlayerSlot: PlayerSlot,
  Message: string,
  ChatMessageType: MatchUpdateChatType
}
enum MatchState {
  InProgress=1,
  // Complete=2?
}
enum MatchUpdateNodeState {
  InComplete=1,
  InProgress=2,
  Complete=3
}
type MatchUpdateNode = {
  nodeNumber: NodeNumber,
  state: MatchUpdateNodeState,
  numHacks:	number,
  proposals: MatchUpdateNodeProposal[]
}
type MatchUpdateNodeProposal = {
  proposer:	PlayerSlot
  accepted:	boolean
  proposedPlayers: PlayerSlot[]
	agreedGuys: PlayerSlot[]
	refusedGuys: PlayerSlot[]
}

export type LogEvents = LogSendEvents & LogReceiveEvents;

type SessionEvents = {
  MindnightSessionUpdate: [MindnightSession|null]
}

type GameEvents = {
  GameUpdate: [Game|undefined],
  Simulate: [string, number, boolean]//filepath, timeBetweenLinesMS, startAtGameFound
}


export type ServerEvents = LogEvents & SessionEvents & GameEvents & {
  ClientInit: [],
  SendToMindnight: [LogSendEvents[keyof LogSendEvents]['0']],
}; //add new events here

export type ServerEventPacket<T extends keyof ServerEvents> = {
  type: T,
  payload: ServerEvents[T]
}