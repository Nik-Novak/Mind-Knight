//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ExistingID } = require('./_shared/schemas');

const { Game, RawGame } = require('./Game');

const PlayerSchema = new Schema({
  steamID:          { type:String, required:true },
  name:             { type:String, required:true },
  gameIDs:          { type:[ExistingID(Game)], default:[] },
  raw_gameIDs:      { type:[ExistingID(RawGame)], default:[] },
  tournamentIDs:    { type:[ExistingID('Tournament')], default:[] },
  elo:              { type:Number, default:1500 },
});

PlayerSchema.index({ steamID:1 }, { unique:true });

const Player = mongoose.model('Player', PlayerSchema);

module.exports = { Player };