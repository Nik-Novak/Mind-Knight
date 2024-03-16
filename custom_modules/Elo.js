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
    let numPlayers = this.game.game_end.Roles.length;
    let numPlayersToNumAgentsMap = {
      5: 3,
      6: 4,
      7: 4,
      8: 5
    }
    let numAgents = numPlayersToNumAgentsMap[numPlayers];
    let numHackers = numPlayers - numAgents;
    this.game.game_end.Roles.forEach(role=>{ //for each player
      let slot = role.Slot;
      let playerIdentity = this.game.game_end.PlayerIdentities.find(pi=>pi.Slot === slot);
      let dbPlayer = players.find(p=>p.steamID === playerIdentity.Steamid); //get their database data
      console.log('PLAYER:', dbPlayer.name, dbPlayer.elo);
      if(role.Role === 10){ //agent
        avgAgentElo += (dbPlayer.elo || 1500) / numAgents;
      }
      else if (role.Role === 20){ //hacker
        avgHackerElo += (dbPlayer.elo || 1500) / numHackers;
      }
    });
    return {avgAgentElo, avgHackerElo};
  }

  async updateElo() {
    let dbPlayers = await Promise.all( this.game.game_end.Roles.map((role)=>{
      let slot = role.Slot;
      let playerIdentity = this.game.game_end.PlayerIdentities.find(pi=>pi.Slot === slot);
      console.log('GETTING PLAYER:', playerIdentity.Steamid, playerIdentity.Nickname )
      return this.db.getOrCreatePlayer(playerIdentity.Steamid, playerIdentity.Nickname)
    }) );
    const K = 20;
    let didAgentsWin = !this.game.game_end.Hacked;
    let {avgAgentElo, avgHackerElo} = await this.getAverageElo(dbPlayers);
    console.log('AVG Agent ELo', avgAgentElo, 'AVG Hacker ELO', avgHackerElo);
    let agentWinProbability = Elo.eloWinProbability(avgAgentElo - avgHackerElo);
    let agentRawIncrement = Number(didAgentsWin) - agentWinProbability;

    console.log('agentWinProbability', agentWinProbability, 'agentRawIncrement', agentRawIncrement);

    let playerSlotToEloMap = {}; // Map<slot:number, {elo:number, eloIncrement:number}>

    for(let role of this.game.game_end.Roles){
      let slot = role.Slot;
      let playerIdentity = this.game.game_end.PlayerIdentities.find(pi=>pi.Slot === slot);
      let dbPlayer = dbPlayers.find(p=>p.steamID === playerIdentity.Steamid); //get their database data
      let eloIncrement = role.Role === 10 /*agent*/ ? agentRawIncrement : -1*agentRawIncrement;
      let scaledEloIncrement = K * eloIncrement;
      playerSlotToEloMap[slot] = {elo: dbPlayer.elo || 1500 , eloIncrement: scaledEloIncrement};
      console.log('PLAYER IDENTITY:', playerIdentity);
      await this.db.updateElo(playerIdentity.Steamid, playerIdentity.Nickname, playerSlotToEloMap[slot].eloIncrement);
    }
    return playerSlotToEloMap;
  }
}

module.exports = {
    Elo
}