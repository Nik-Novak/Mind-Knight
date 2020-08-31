//@ts-check
const _ = require('lodash');
const { Player } = require('./player');

class Role {
  static idToNameMap = {
    10: 'Agent',
    20: 'Hacker'
  }
  static idToTeamMap = {
    10: 'Agent',
    20: 'Hacker'
  }
  constructor(roleID){
    this.roleID = roleID;
  }
  get name(){
    return Role.idToNameMap[this.roleID];
  }
  get team(){
    return Role.idToTeamMap[this.roleID];
  }
}

class GamePlayer {
  /**
   * @param {number|object} slotOrPlayerIdentity 
   * @param {Game} game 
   */
  constructor(slotOrPlayerIdentity, game){
    this.game = game;
    if(typeof slotOrPlayerIdentity === 'number')
      this.playerIdentity = _.find(this.game.data.game_end.PlayerIdentities, (playerIdentity)=>playerIdentity.Slot==slotOrPlayerIdentity);
    else
      this.playerIdentity=slotOrPlayerIdentity;
    if(!this.playerIdentity)
      throw Error('GamePlayer cannot be created for a player that is not in the game.')
    this.slot = this.playerIdentity.Slot;
    this.playerData = this.game.data.players[this.slot];
    let roleID = this.game.data.game_end.Roles[this.slot].Role;
    this.role = new Role(roleID);
  }

  get name(){
    return this.playerData.Username;
  }

  get username(){
    return this.playerIdentity.Nickname;
  }

  get Steamid(){
    return this.playerIdentity.Steamid;
  }

  get proposals(){
    return Object.values(this.playerData.proposals).map(proposalData=>new Proposal(proposalData, this.game));
  }
  
  didWin(){
    return this.game.hacked && this.role.team == 'Hacker' || !this.game.hacked && this.role.team == 'Agent'
  }
}

class Mission {
  /**
   * 
   * @param {*} data 
   * @param {Game} game 
   */
  constructor(number, data, game){
    this.number = number;
    this.data = data
    this.game = game;
  }

  get hacked(){
    return this.data.mission_phase_end.Failed
  }

  get numHacksDetected(){
    return this.data.mission_phase_end.NumHacks;
  }

  /**
   * 
   * @param {Player} player 
   */
  hasPlayer(player){
    return this.game.hasPlayer(player) && this.data.mission_phase_start.Players.includes( this.game.getGamePlayer(player).slot );
  }

  get numHackers(){
    return this.gamePlayers.filter(gamePlayer=>gamePlayer.role.name=="Hacker").length;
  }

  get proposer(){
    let proposerSlot = this.data.mission_phase_end.Proposer;
    return new GamePlayer(proposerSlot, this.game);
  }

  get numPlayers(){
    return this.data.mission_phase_start.Players.length;
  }

  /**
   * @returns {GamePlayer[]}
   */
  get gamePlayers(){
    return this.data.mission_phase_start.Players.map(playerSlot => new GamePlayer(playerSlot, this.game));
  }

  get propIndex(){
    return this.data.mission_phase_end.propNumber-1;
  }
}

class Proposal {
  constructor(data, game){
    this.data = data;
    this.game = game;
  }

  get proposer(){
    return new GamePlayer(this.data.Proposer, this.game);
  }

  get passed(){
    return this.data.Passed;
  }

  get numPlayers(){
    return this.data.Amount;
  }

  get gamePlayers(){
    let gamePlayers = [];
    this.data.vote_phase_start.Players.forEach(playerSlot=>gamePlayers.push(new GamePlayer(playerSlot, this.game)));
    return gamePlayers;
  }

  get gamePlayersAccepted(){
    let gamePlayers = [];
    this.data.vote_phase_end.VotesFor.forEach(playerSlot=>gamePlayers.push(new GamePlayer(playerSlot, this.game)))
    return this.gamePlayers;
  }

  get gamePlayersRefused(){
    let gamePlayers = [];
    this.data.vote_phase_end.VotesAgainst.forEach(playerSlot=>gamePlayers.push(new GamePlayer(playerSlot, this.game)))
    return this.gamePlayers;
  }
}

class Game {
  constructor(data){
    if(!data)
      throw Error('Game cannot be null');
    this.data = data;
  }
  
  get hacked(){ return this.data.game_end.Hacked };

  get deltaT(){
    return new Date(this.data.game_end.timestamp).getTime() - new Date(this.data.game_start.timestamp).getTime();
  }
  
  get hackers(){
    return this.gamePlayers.filter(gamePlayer=>gamePlayer.role.name=="Hacker");
  }

  get numPlayers(){
    return this.data.game_found.PlayerNumber;
  }

  get missions(){
    return Object.entries(this.data.missions).map(
      ([missionNum, mission])=>new Mission(missionNum, mission, this)
    );
  }

  get gamePlayers(){
    return Object.entries(this.data.game_end.PlayerIdentities).map(([slot, playerIdentity])=>new GamePlayer(playerIdentity,this));
  }

  /**
   * @callback proposalFilter
   * @param {Proposal} proposal
   * @param {Game} game
   * @param {Player} player
   * @param {GamePlayer} gamePlayer
   */
  /**
   * @param {proposalFilter} proposalFilter
   * @param {Player} player
   * @returns {Proposal[]}
   */
  filterProposals(proposalFilter=(proposal, game, player, gamePlayer)=>true, player=undefined){
    let filteredProposals = [];
    this.gamePlayers.forEach(
      gamePlayer=>gamePlayer.proposals.filter(proposal=>proposalFilter(proposal, this, player, player&&this.hasPlayer(player) && this.getGamePlayer(player) )).forEach(proposal=>filteredProposals.push(proposal))
    );
    return filteredProposals
  }

  /**
   * @callback missionFilter
   * @param {Mission} mission
   * @param {Player} player
   * @param {GamePlayer} gamePlayer
   */
  /**
   * @param {missionFilter} missionFilter
   * @param {Player} player
   * @returns {Mission[]}
   */
  filterMissions(missionFilter=(mission, player, gamePlayer)=>true, player=undefined){
    return Object.entries(this.data.missions).map(
      ([missionNum, mission])=>new Mission(missionNum, mission, this)
    ).filter(
      mission=>missionFilter(mission, player, player&&this.hasPlayer(player) && this.getGamePlayer(player))
    );
  }

  /**
   * @param {Player} player 
   */
  hasPlayer(player){
    for (let [slot, gamePlayer] of Object.entries(this.data.game_end.PlayerIdentities))
      if(player.steamID!=undefined && player.steamID == gamePlayer.SteamID || player.name!=undefined && player.name == gamePlayer.Nickname)
        return true;
    return false;
  }

  getGamePlayer(player){
    let playerIdentity = _.find(this.data.game_end.PlayerIdentities, (playerIdentity)=>playerIdentity.Steamid==player.steamID);
    return new GamePlayer(playerIdentity, this);
  }

  /**
   * @param {Player} player 
   */
  didWin(player){
    let playerIdentity = _.find(this.data.game_end.PlayerIdentities, (playerIdentity)=>playerIdentity.Steamid==player.steamID);
    let gamePlayer = new GamePlayer(playerIdentity, this);
    return gamePlayer.didWin();
  }

  getPlayerIdentity(slot){
    return this.data.game_end.PlayerIdentities[slot];
  }

  printResults(){
    console.log('Played at:', this.data.game_found.timestamp)
    console.log('Winner:', this.hacked ? 'Hackers' : 'Agents');
    console.log('Players:')
    this.data.game_end.PlayerIdentities.forEach(playerIdentity=>{
      let slot = playerIdentity.Slot;
      let role = new Role(this.data.game_end.Roles[slot].Role);
      let didWin = ( !this.hacked && role.name=='Agent' || this.hacked && role.name=='Hacker' )
      console.log(`\t Player[${slot}]:`)
      console.log(`\t\t Name: ${playerIdentity.Nickname}(${this.data.players[slot].Username})`);
      console.log(`\t\t Role: ${role.name}`);
      console.log(`\t\t Outcome: ${didWin ? 'Win' : 'Loss'}`);
      
    });
    console.log('Nodes:');
    // console.log(this.data.missions)
    this.missions.forEach((mission, missionIndex)=>{
      if(mission == undefined){ console.log(`Weird non-existant entry bug. Key:${missionIndex+1}, Value:${mission}`); return;}
      console.log(`\t Node ${missionIndex+1}`)
      console.log(`\t\t ProposedBy: ${mission.proposer.username}(${mission.proposer.name})`);
      console.log(`\t\t Players: ${mission.gamePlayers.map(gamePlayer=>`${gamePlayer.username}(${gamePlayer.name})`).join(', ')}`);
      console.log(`\t\t Result: ${mission.hacked?`Hacked(${mission.numHacksDetected})`:'Secured'}`);
      console.log(`\t\t PropIndex: ${mission.propIndex}/5`);
    });
  }

}

module.exports = { Game, GamePlayer, Mission }