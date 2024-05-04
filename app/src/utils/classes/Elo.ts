import { database } from "@/database";
import { ServerEvents } from "@/types/events";
import { NumberOfPlayers, PlayerSlot } from "@/types/game";
import { GameEnd, Player } from "@prisma/client";

export class Elo {

  constructor(private game_end:ServerEvents['GameEnd']['0']){
  }

  static eloWinProbability(elo_difference:number){
    return 0.2 + (0.6 / (1 + Math.pow(10, -(elo_difference/400))))
  }

  async getAverageElo(players:Player[]){
    if(!this.game_end)
      throw Error("Game must have en end to determine elo.");
    let avgAgentElo = 0;
    let avgHackerElo = 0;
    let numPlayers = this.game_end.Roles.length as NumberOfPlayers;
    let numPlayersToNumAgentsMap = {
      5: 3,
      6: 4,
      7: 4,
      8: 5
    }
    let numAgents = numPlayersToNumAgentsMap[numPlayers];
    let numHackers = numPlayers - numAgents;
    this.game_end.Roles.forEach(role=>{ //for each player
      let slot = role.Slot;
      let playerIdentity = this.game_end!.PlayerIdentities.find(pi=>pi.Slot === slot);
      if(!playerIdentity)
        throw Error("Something went wrong");
      let dbPlayer = players.find(p=>p.steam_id === playerIdentity.Steamid); //get their database data
      if(!dbPlayer)
        throw Error("Could not find a db player for steamid: " + playerIdentity.Steamid)
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
    if(!this.game_end)
      throw Error("Game must have en end to update elo.");
    let dbPlayers = await Promise.all( this.game_end.Roles.map((role)=>{
      let slot = role.Slot;
      let playerIdentity = this.game_end!.PlayerIdentities.find(pi=>pi.Slot === slot);
      if(!playerIdentity)
        throw Error("Error determining playerIdentity for slot: " + slot);
      console.log('GETTING PLAYER:', playerIdentity.Steamid, playerIdentity.Nickname );
      return database.player.createOrFind({data:{name:playerIdentity.Nickname, steam_id: playerIdentity.Steamid, level:playerIdentity.Level }}, { where:{steam_id:playerIdentity.Steamid} });//this.db.getOrCreatePlayer(playerIdentity.Steamid, playerIdentity.Nickname)
    }) );
    const K = 20;
    let didAgentsWin = !this.game_end.Hacked;
    let {avgAgentElo, avgHackerElo} = await this.getAverageElo(dbPlayers);
    console.log('AVG Agent ELo', avgAgentElo, 'AVG Hacker ELO', avgHackerElo);
    let agentWinProbability = Elo.eloWinProbability(avgAgentElo - avgHackerElo);
    let agentRawIncrement = Number(didAgentsWin) - agentWinProbability;

    console.log('agentWinProbability', agentWinProbability, 'agentRawIncrement', agentRawIncrement);

    let playerSlotToEloMap:{[key:number]: {elo:number, eloIncrement:number}} = {}; // Map<slot:number, {elo:number, eloIncrement:number}>

    for(let role of this.game_end.Roles){
      let slot = role.Slot as PlayerSlot;
      let playerIdentity = this.game_end.PlayerIdentities.find(pi=>pi.Slot === slot);
      if(!playerIdentity)
        throw Error("Error determining playerIdentity for slot: " + slot);
      let dbPlayer = dbPlayers.find(p=>p.steam_id === playerIdentity.Steamid); //get their database data
      if(!dbPlayer)
        throw Error("Unable to find db player with steamId:" + playerIdentity.Steamid);
      let eloIncrement = role.Role === 10 /*agent*/ ? agentRawIncrement : -1*agentRawIncrement;
      let scaledEloIncrement = K * eloIncrement;
      playerSlotToEloMap[slot] = {elo: dbPlayer.elo || 1500 , eloIncrement: scaledEloIncrement};
      console.log('PLAYER IDENTITY:', playerIdentity);
      console.log('Increment:', scaledEloIncrement);
      await database.player.update({where:{steam_id: playerIdentity.Steamid}, data:{elo: {increment:playerSlotToEloMap[slot].eloIncrement}}});
    }
    return playerSlotToEloMap;
  }
}