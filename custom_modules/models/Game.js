//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Integer, ExistingID } = require('./_shared/schemas');

const RawGameSchema = new Schema({
  data: { type:String, required:true },
  timestamp: { type:Date, required:true }
});

const RawGame = mongoose.model('RawGame', RawGameSchema);

const GameOptionsSchema = {
  GameMode:               { ...Integer.Positive, required:true },
  HammerEnabled:          { type:Boolean, required:true },
  MapPickOption:          { ...Integer.Positive, required:true },
  Maps:                   { type:[Integer.Positive], required:true },
  MaxPlayers:             { ...Integer.Positive, required:true },
  NamingConvention:       { ...Integer.Positive, required:true },
  SkipTalkingPhaseEnabled:{ type:Boolean, required:true },
  Visibility:             { ...Integer.Positive, required:true },
}

const GameFoundSchema = {
  FirstPlayer:      { ...Integer.Positive, required:true },
  GuyRole:          { ...Integer.Positive, required:true },
  Hacker:           { type:Boolean, required:true },
  Hackers:          { type:[Integer.Positive], required:true },
  HackersAmount:    { ...Integer.Positive, required:true },
  Map:              { ...Integer.Positive, required:true },
  MatchType:        { ...Integer.Positive, required:true },
  MissionInfo:      { type:[Integer.Positive], required:true }, //default: [2,3,2,3,3]
  MissionMinhacks:  { type:[Integer.Positive], required:true }, //default: [1,1,1,1,1]
  Options:          GameOptionsSchema,
  PlayerNumber:     { ...Integer.Positive, required:true },
  Type:             { ...Integer.Positive, required:true },
  VoiceChat:        { type:Boolean, required:true },
  VoiceChatChannel: { type:String, required:true },
  VoiceChatName:    { type:String, required:true },
  timestamp:        { type:Date, required:true }
}

const GameStartSchema = {
  Type:             { ...Integer.Positive, required:true }, //packet type not game type
  AFK:              { type:[Integer.Positive], required:true },
  Disconnected:     { type:[Integer.Positive], required:true },
  timestamp:        { type:Date, required:true }
}

const VotePhaseStartSchema = new Schema({
  Duration:         { ...Integer.Positive, required:true },
  Players:          { type:[Integer.Positive], required:true },
  Proposer:         { ...Integer.Positive, required:true },
  Type:             { ...Integer.Positive, required:true },
  timestamp:        { type:Date, required:true }
});

const VoteSchema = new Schema({
  Slot:           { ...Integer.Positive, required:true },
  Type:           { ...Integer.Positive, required:true },
  deltaT:         { ...Integer.Positive, required:true },
  timestamp:      { type:Date, required:true },
});

const VoteMadeSchema = new Schema({ //LIMITATION: 8 max players assumption
  0:                VoteSchema,
  1:                VoteSchema,
  2:                VoteSchema,
  3:                VoteSchema,
  4:                VoteSchema,
  5:                VoteSchema,
  6:                VoteSchema,
  7:                VoteSchema,
});

const VotePhaseEndSchema = new Schema({
  Passed:           { type:Boolean, required:true },
  Type:             { ...Integer.Positive, required:true },
  VotesFor:         { type:[Integer.Positive], required:true },
  VotesAgainst:     { type:[Integer.Positive], required:true },
  chatIndex:        { ...Integer.Positive, required:true },
  deltaT:           { ...Integer.Positive, required:true },
  timestamp:        { type:Date, required:true }
});

const ProposalSchema = {
  Amount:           { ...Integer.Positive, required:true },
  Duration:         { ...Integer.Positive, required:true },
  Mission:          { ...Integer.Positive, required:true },
  NextPlayer:       { ...Integer.Positive, required:true },
  Passed:           { type:Boolean, required:true },
  Player:           { ...Integer.Positive, required:true },
  Proposer:         { ...Integer.Positive, required:true },
  SelectedTeam:     { type:[Integer.Positive], required:true },
  Type:             { ...Integer.Positive, required:true },
  chatIndex:        { ...Integer.Positive, required:true },
  deltaT:           { ...Integer.Positive, required:true },
  propNumber:       { ...Integer.Positive, required:true },
  timestamp:        { type:Date, required:true },
  vote_phase_start: VotePhaseStartSchema,       
  vote_made:        VoteMadeSchema,       
  vote_phase_end:   VotePhaseEndSchema,       
}

const PlayerProposalSchema = { //LIMITATION: 5 nodes assumption
  //mission number
  1:                [ProposalSchema],
  2:                [ProposalSchema],
  3:                [ProposalSchema],
  4:                [ProposalSchema],
  5:                [ProposalSchema],
}

const PlayerSchema = new Schema({
  Color:            { ...Integer.Positive, required:true },
  Female:           { type:Boolean, required:true },
  IsLocal:          { type:Boolean, required:true },
  Skin:             { type:String, required:true },
  Slot:             { ...Integer.Positive, required:true },
  Type:             { ...Integer.Positive, required:true },
  Username:         { type:String, required:true },
  chat:             { type:[Integer.Positive], required:true }, //array of chat messages mapped to chat indices
  proposals:        PlayerProposalSchema,
  timestamp:        { type:Date, required:true }
});

const PlayersSchema = {
  0:                PlayerSchema,
  1:                PlayerSchema,
  2:                PlayerSchema,
  3:                PlayerSchema,
  4:                PlayerSchema,
  5:                PlayerSchema,
  6:                PlayerSchema,
  7:                PlayerSchema
}

const MissionPhaseStartSchema = {
  Duration:         { ...Integer.Positive, required:true },
  Mission:          { ...Integer.Positive, required:true },
  Players:          { type:[Integer.Positive], required:true },
  Type:             { ...Integer.Positive, required:true }, //packet type not game type
  timestamp:        { type:Date, required:true }
}

const MissionPhaseEndSchema = {
  Failed:           { type:Boolean, required:true },
  Mission:          { ...Integer.Positive, required:true },
  NumHacks:         { ...Integer.Positive, required:true },
  Proposer:         { ...Integer.Positive, required:true },
  Type:             { ...Integer.Positive, required:true },
  chatIndex:        { ...Integer.Positive, required:true },
  deltaT:           { ...Integer.Positive, required:true },
  propNumber:       { ...Integer.Positive, required:true },
  timestamp:        { type:Date, required:true }
}

const MissionSchema = new Schema({
  mission_phase_start: MissionPhaseStartSchema,
  mission_phase_end: MissionPhaseEndSchema,
})

const MissionsSchema = { //LIMITATION: 5 nodes assumption
  1:                MissionSchema,
  2:                MissionSchema,
  3:                MissionSchema,
  4:                MissionSchema,
  5:                MissionSchema,
}

const RoleSchema = {
  Slot:             { ...Integer.Positive, required:true },
  Role:             { ...Integer.Positive, required:true }, //10 = agent, 20 = hacker
}

const PlayerIdentitySchema = {
  Slot:             { ...Integer.Positive, required:true },
  Nickname:         { type:String, required:true },
  Steamid:          { type:String, required:true },
  Level:            { ...Integer.Positive, required:true }
}

const GameEndSchema = {
  Type:             { ...Integer.Positive, required:true },
  Hacked:           { type:Boolean, required:true },
  Hackers:          { type:[Integer.Positive], required:true },
  Canceled:         { type:Boolean, required:true },
  Roles:            { type:[RoleSchema], required:true },
  Timeout:          { ...Integer.Positive, required:true },
  PlayerIdentities: { type:[PlayerIdentitySchema], required:true },
  AfterGameLobby:   { type:String, required:true },
  timestamp:        { type:Date, required:true },
}

const ChatMsgSchema = {
  Message:    { type:String, default:"" }, //should be required=true, not sure why messages are being saved that have no content
  Slot:    { ...Integer.Positive, default:-1 },
  Type:    { ...Integer.Positive, default:-1 },
  index:    { ...Integer.Positive, default:-1 },
  timestamp:        { type:Date, default:new Date(0) },
}

const GameSchema = new Schema({
  game_found: GameFoundSchema,
  game_start: GameStartSchema,
  players:    PlayersSchema,
  missions:   MissionsSchema,
  game_end:   GameEndSchema,
  chat:       { type:[ChatMsgSchema], default:[] },
  local_slot: { ...Integer.Positive, required:true },
  timestamp:  { type:Date, default:()=>new Date() },
  raw_gameID: { ...ExistingID(RawGame), required:true }
});

const Game = mongoose.model('Game', GameSchema);

module.exports = { Game, RawGame };

//TODO prevent duplicate games two people using client same game
