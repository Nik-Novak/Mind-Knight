class Elo {

  constructor(game, db){
    this.game=game;
    this.db=db;
  }

  static eloWinProbability(elo_difference){
    return 0.2 + (0.6 / (1 + Math.pow(10, -(elo_difference/400))))
  }

  async getAverageElo(players){
    let avgAgentElo = 0;
    let avgHackerElo = 0;
    this.game.game_end.Roles.forEach(role=>{ //for each player
      let numPlayers = game.game_end.Roles.length;
      let slot = role.Slot;
      let gamePlayer = this.game.players[slot]; //get this game's data
      let playerIdentity = this.game.game_end.PlayerIdentities.find(pi=>pi.Slot === slot);
      let dbPlayer = players.find(p=>p.steamID === playerIdentity.Steamid); //get their database data
      if(role.Role === 10){ //agent
        avgAgentElo += (dbPlayer.elo || 1500) / numPlayers;
      }
      else if (role.Role === 20){ //hacker
        avgHackerElo += (dbPlayer.elo || 1500) / numPlayers;
      }
    });
    return {avgAgentElo, avgHackerElo};
  }

  async updateElo() {
    let dbPlayers = await Promise.all( Object.entries(game.players).map(([slot, gamePlayer])=>{
      return this.db.getOrCreatePlayer(gamePlayer.steamID, gamePlayer.name)
    }) );
    let didAgentsWin = !this.game.game_end.Hacked;
    let {avgAgentElo, avgHackerElo} = await this.getAverageElo(game, dbPlayers);

    let agentWinProbability = Elo.eloWinProbability(avgAgentElo - avgHackerElo);
    let agentRawIncrement = Number(didAgentsWin) - agentWinProbability;

    let playerSlotToEloMap = {}; // Map<slot:number, {elo:number, eloIncrement:number}>

    for(let role of this.game.game_end.Roles){
      let slot = role.Slot;
      let playerIdentity = this.game.game_end.PlayerIdentities.find(pi=>pi.Slot === slot);
      let dbPlayer = dbPlayers.find(p=>p.steamID === playerIdentity.Steamid); //get their database data
      let eloIncrement = role === 10 /*agent*/ ? agentRawIncrement : -agentRawIncrement;
      playerSlotToEloMap[slot] = {elo: dbPlayer.elo || 1500 , eloIncrement};
      await this.db.updateElo(playerIdentity.Steamid, playerIdentity.Nickname, eloIncrement);
    }
    return playerSlotToEloMap;
  }
}