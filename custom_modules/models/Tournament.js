//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ExistingID, Integer } = require('./_shared/schemas');

const { Game } = require('./Game');
const { Player } = require('./Player');

const cryptojs = require('crypto-js');

const options = {discriminatorKey:'_type'};

const PlayerReplacementSchema = new Schema({
  backup_roster_index: { ...Integer.Positive, required:true },
  timestamp:    { type:Date, required:true }
});

const TournamentPlayerSchema = new Schema({
  playerID:     { ...ExistingID(Player), required:true },
  replaced:     PlayerReplacementSchema
});

const TournamentSchema = new Schema({
  name:         { type:String, required:true },
  roster:       { type:[TournamentPlayerSchema], required:true },
  backup_roster:{ type:[TournamentPlayerSchema], required:true },
  // @ts-ignore
  code:         { type:String, default:function(){ let hash = cryptojs.MD5(this.name).toString(); return hash.substr(hash.length-8,8).toUpperCase(); } },
  created:      { type:Date, default:()=>new Date() },
  completed:    Date
}, options );

TournamentSchema.index({ name:1 }, { unique:true });
TournamentSchema.index({ code:1 }, { unique:true });

const Tournament = mongoose.model('Tournament', TournamentSchema);

const TournamentGameSchema = {
  scheduled:                  { type:Date, required:true },  //scheduled time of the game
  player_roster_indexes:      { type:[Integer.Positive] },
  gameID:                     ExistingID(Game)
}

const HeatSchema = {
  games:        { type:[TournamentGameSchema], default:[] }
}

const DaySchema = {
  date:         { type:Date, required:true },
  heats:        { type:[HeatSchema], default:[] }
}

const StandardTournamentSchema = new Schema({
  days:         { type:[DaySchema], default:[] },
}, options );

const StandardTournament = Tournament.discriminator('StandardTournament', StandardTournamentSchema);

module.exports = { Tournament, StandardTournament };