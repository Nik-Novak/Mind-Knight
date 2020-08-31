//@ts-check
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ExistingID } = require('./_shared/schemas');

const { Player } = require('./Player');

const UserSchema = new Schema({
  UUID:             { type:String, required:true },
  playerID:         { ...ExistingID(Player), required:true }
});

UserSchema.index({ UUID:1 }, { unique:true });

const User = mongoose.model('User', UserSchema);

module.exports = { User };