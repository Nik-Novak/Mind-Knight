

//@ts-check
const _ = require('lodash');
const { Player } = require('./player');
const { Game, Mission, GamePlayer, Proposal } = require('./game');

class StandardTournament {
  #roster;
  #allGames;

  constructor(data, gameResolver=(gameID)=>undefined, playerResolver=(playerID)=>undefined ){
    this.data = data;
    this.gameResolver = gameResolver;
    this.playerResolver = playerResolver;
  }

  /**
   * @returns {Promise<Game[]>}
   */
  getAllGames(){
    if(this.#allGames)
      return this.#allGames;
    let gameIDs = [];
    this.data.days.forEach(day=>
      day.heats.forEach(heat=>
        heat.games.forEach(game=>gameIDs.push(game.gameID))
      )
    )
    this.#allGames = Promise.all(gameIDs.map(async gameID=>new Game(await this.gameResolver(gameID))));
    return this.#allGames;
  }

  /**
   * @returns {Promise<Player[]>}
   */
  getAllRosterPlayers(){
    if(this.#roster)
      return this.#roster;
    this.#roster = Promise.all( this.data.roster.map(async rosterPlayer=>new Player( await this.playerResolver(rosterPlayer.playerID) )) );
    return this.#roster;
  }

  async getHackerWinrateGlobal(){
    let hackedGames = 0;
    let allGames = await this.getAllGames();
    allGames.forEach(game => game.hacked && ++hackedGames );
    return hackedGames / allGames.length;
  }

  /**
   * @callback gameFilter
   * @param {Game} game
   * @param {Player} player
   * @param {GamePlayer} gamePlayer
   */

  /**
   * @param {gameFilter} gameFilter
   * @param {Player} player
   * @returns {Game[]}
   */
  static filterGames(gameFilter=(game,player,gamePlayer)=>true, games, player=undefined){
    return games.filter(
      game=>gameFilter( game, player, player && game.hasPlayer(player)&&game.getGamePlayer(player)||undefined )
    );
  }

/**
 * @callback gameReducer
 * @param {any} accum
 * @param {Game} game
 * @param {Player} player
 * @param {GamePlayer} gamePlayer
 */

/**
 * @param {gameReducer} gameReducer
 * @param {Player} player
 * @returns {any}
*/
static reduceGames(gameReducer=(accum, game, player, gamePlayer)=>undefined, games, initialValue=undefined, player=undefined){
  return games.reduce(
    (accum, game)=>gameReducer(accum, game, player, player && game.hasPlayer(player)&&game.getGamePlayer(player)||undefined ), 
    initialValue
  );
}



  /**
   * 
   * @param {Player} player 
   */
  static getSubsetPercentageOfGames(gameSubsetFilter=(game,player,gamePlayer)=>true, gameFilter=(game,player,gamePlayer)=>true, games, player){
    let filteredGames = StandardTournament.filterGames( gameFilter, games, player );
    let filteredGamesSubset = StandardTournament.filterGames( gameSubsetFilter, filteredGames, player );
    return filteredGamesSubset.length / filteredGames.length;
  }

  /**
   * @param {Game[]} games
   * @param {Player[]} players
   */
  static getPlayersWithHighestSubsetPercentageOfGames( gameSubsetFilter=(game, gamePlayer)=>true, gameFilter=(game, gamePlayer)=>true, games, players ){
    let highestPercent = -1;
    let highestPlayers = [];

    players.forEach(player=>{
      let percent = StandardTournament.getSubsetPercentageOfGames(gameSubsetFilter, gameFilter, games, player);
      if(percent > highestPercent){
        highestPercent = percent;
        highestPlayers = [player];
      }
      else if(percent==highestPercent) 
        highestPlayers.push(player);
    });
    return { players:highestPlayers, winrate:highestPercent };
    // await this.getPlayerWinrate(testPlayer, (game, gamePlayer)=>gamePlayer.role.name == "Agent")
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
  static filterMissions(missionFilter=(mission, player, gamePlayer)=>undefined, games, player=undefined){
    let missions = [];
    games.forEach(
      game=>missions.push(...game.filterMissions(missionFilter, player))
    );
    return missions;
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
  static filterProposals(proposalFilter=(proposal, game, player, gamePlayer)=>true, games, player){
    let proposals = [];
    games.forEach(
      game=>proposals.push(...game.filterProposals(proposalFilter, player))
    );
    return proposals;
  }

  /**
   * 
   * @param {*} metricFunction 
   * @param {*} players 
   */
  static playerWithHighestMetric(metricFunction=(player)=>undefined, players){
    let highest = Number.MIN_VALUE;
    let highestPlayers = [];
    players.forEach(player=>{
      let metric = metricFunction(player);
      if(metric > highest){
        highest = metric;
        highestPlayers = [player]
      }
      else if(metric === highest)
        highestPlayers.push(player);
    });
    return { players:highestPlayers, highest };
  }

  formatDeltaT(deltaT){
    deltaT/=1000;
    let days = Math.floor(deltaT / 86400);
      deltaT -= days * 86400;

      // calculate (and subtract) whole hours
      let hours = Math.floor(deltaT / 3600) % 24;
      deltaT -= hours * 3600;

      // calculate (and subtract) whole minutes
      let minutes = Math.floor(deltaT / 60) % 60;
      deltaT -= minutes * 60;
      return { hours, minutes };
  }

  async printGlobalStats(){
    const Percent = new Intl.NumberFormat( 'en-US', {style:'percent', minimumFractionDigits:2, maximumFractionDigits:2} );
    let allGames = await this.getAllGames();
    let allRosterPlayers = await this.getAllRosterPlayers();
    console.log('Global Stats (applying to all matches):');
    let hackerWinrateGlobal = await this.getHackerWinrateGlobal();
    console.log('\t % Agent winrate:', Percent.format(1-hackerWinrateGlobal));
    console.log('\t % Hacker winrate:', Percent.format(hackerWinrateGlobal));
    let playersWithHighestWinrate = StandardTournament.getPlayersWithHighestSubsetPercentageOfGames( 
      (game,player,gamePlayer)=>game.didWin(player), 
      (game,player,gamePlayer)=>game.hasPlayer(player), 
      allGames, 
      allRosterPlayers 
    );
    console.log('\t Player(s) with highest overall winrate:', playersWithHighestWinrate.players.map(player=>player.name).join(', '), `(${Percent.format(playersWithHighestWinrate.winrate)})`);
    let playersWithHighestAgentWinrate = StandardTournament.getPlayersWithHighestSubsetPercentageOfGames(
      (game,player,gamePlayer)=>game.didWin(player), 
      (game,player,gamePlayer)=>game.hasPlayer(player) && gamePlayer.role.name == "Agent", 
      allGames, 
      allRosterPlayers 
    );
    console.log('\t Player(s) with highest agent winrate:', playersWithHighestAgentWinrate.players.map(player=>player.name).join(', '), `(${Percent.format(playersWithHighestAgentWinrate.winrate)})`);
    let playersWithHighestHackerWinrate = StandardTournament.getPlayersWithHighestSubsetPercentageOfGames(
      (game,player,gamePlayer)=>game.didWin(player), 
      (game,player,gamePlayer)=>game.hasPlayer(player) && gamePlayer.role.name == "Hacker", 
      allGames, 
      allRosterPlayers 
    );
    console.log('\t Player(s) with highest hacker winrate:', playersWithHighestHackerWinrate.players.map(player=>player.name).join(', '), `(${Percent.format(playersWithHighestHackerWinrate.winrate)})`);

    let numHackedNodesAsAgent = (player)=>StandardTournament.filterMissions( 
      (mission, player, gamePlayer)=>mission.hasPlayer(player) && mission.hacked && gamePlayer.role.name=="Agent", allGames, player 
    ).length
    let agentsThatWereInTheMostHackedNodes = StandardTournament.playerWithHighestMetric(numHackedNodesAsAgent, allRosterPlayers);
    console.log(`\t Agent(s) that were in the most hacked nodes: ${agentsThatWereInTheMostHackedNodes.players.map(player=>player.name).join(', ')} (${agentsThatWereInTheMostHackedNodes.highest})`);

    let numSecuredNodesAsHacker = (player)=>StandardTournament.filterMissions(
      (mission, player, gamePlayer)=>mission.hasPlayer(player) && !mission.hacked && gamePlayer.role.name=="Hacker", allGames, player 
    ).length
    let hackersThatWereInTheMostSecuredNodes = StandardTournament.playerWithHighestMetric(numSecuredNodesAsHacker, allRosterPlayers);
    console.log(`\t Hacker(s) that were in the most secured nodes: ${hackersThatWereInTheMostSecuredNodes.players.map(player=>player.name).join(', ')} (${hackersThatWereInTheMostSecuredNodes.highest})`);
    
    let numberOfAcedAgentGames = StandardTournament.filterGames((game)=>!game.hacked && game.missions.length===3, allGames).length;
    console.log(`\t Number of aced agent games: ${numberOfAcedAgentGames}`);
    let numberOfAcedHackerGames = StandardTournament.filterGames((game, player, gamePlayer)=>game.hacked && game.missions.length===3, allGames).length;
    console.log(`\t Number of aced hacker games: ${numberOfAcedHackerGames}`);

    let allMissions = StandardTournament.filterMissions(()=>true, allGames);
    let numHackedMissions = allMissions.filter(mission=> mission.hacked).length;
    console.log(`\t Number of nodes: ${allMissions.length}`);
    console.log(`\t Number of hacked nodes: ${numHackedMissions}`);
    console.log(`\t Number of secured nodes: ${allMissions.length - numHackedMissions}`);

    let twoManMissions = allMissions.filter(mission=>mission.numPlayers==2 && mission.numHackers>0);
    let numBluffed2ManMissions = twoManMissions.filter(mission=>!mission.hacked ).length;
    console.log(`\t % of 2 man nodes bluffed ${Percent.format(numBluffed2ManMissions/twoManMissions.length)}`);

    let allN1Missions = allMissions.filter(mission=>mission.number==1);
    let numAllN1MissionsWith2Agents = allN1Missions.filter(
      mission=>mission.gamePlayers.filter(gamePlayer=>gamePlayer.role.name == "Agent").length == mission.numPlayers
    ).length;
    console.log(`\t % of all games that had 2 agents in n1: ${Percent.format(numAllN1MissionsWith2Agents/allN1Missions.length)}`);

    let gamesWhereN3HackedAfter1PriorHack = StandardTournament.filterGames((game)=>game.missions[2].hacked && game.missions.slice(0,3).find(mission=>mission.hacked)!=undefined, allGames );
    let numHackerWinsIngamesWhereN3HackedAfter1PriorHack = gamesWhereN3HackedAfter1PriorHack.filter(game=>game.hacked).length
    console.log( `\t % hacker winrate for games where n3 is hacked after 1 prior hack: ${Percent.format(numHackerWinsIngamesWhereN3HackedAfter1PriorHack/gamesWhereN3HackedAfter1PriorHack.length)}` );

    let numMissionsThatHadABetaHackerN3 = allMissions.filter( mission=>mission.number==3 && !mission.hacked && mission.numHackers>0 ).length;
    console.log(`\t % of games that had a hacker beta n3: ${Percent.format(numMissionsThatHadABetaHackerN3/allGames.length)}`);
    
    let gamesWhereHackersAreSideBySide = allGames.filter(game=>{
      let hackerSlots = game.gamePlayers.filter(gamePlayer=> gamePlayer.role.name=="Hacker").map(gamePlayer=>gamePlayer.slot);
      if (areAdjacent(hackerSlots, game.numPlayers))
        return true;
      return false;
    });
    console.log(`\t % of games where hackers were side-by-side: ${Percent.format(gamesWhereHackersAreSideBySide.length/allGames.length)}`);
    let numGamesWhereHackersWonSideBySide = gamesWhereHackersAreSideBySide.filter(game=>game.hacked).length;
    console.log(`\t % hacker winrate in games where hackers were side-by-side: ${Percent.format(numGamesWhereHackersWonSideBySide/gamesWhereHackersAreSideBySide.length)}`);

    let gamesWhereHackersAreNOTSideBySide = allGames.filter(game=>{
      let hackerSlots = game.gamePlayers.filter(gamePlayer=> gamePlayer.role.name=="Hacker").map(gamePlayer=>gamePlayer.slot);
      if (!areAdjacent(hackerSlots, game.numPlayers))
        return true;
      return false;
    });
    let numGamesWhereHackersWonNOTSideBySide = gamesWhereHackersAreNOTSideBySide.filter(game=>game.hacked).length;
    console.log(`\t % hacker winrate in games where hackers were NOT side-by-side: ${Percent.format(numGamesWhereHackersWonNOTSideBySide/gamesWhereHackersAreNOTSideBySide.length)}`);
    
    let highestWinstreakMetricFunction = (player)=>StandardTournament.reduceGames((accum, game, player, gamePlayer)=>{
      if(game.hasPlayer(player)){
        if(game.didWin(player)){ //win adds to current winstreak and sets highest winstreak if possible
          if(accum.current+1>accum.highest)
            accum.highest = accum.current+1;
          return { ...accum, current:accum.current+1 }
        }
        else //loss resets current winstreal
          return { ...accum, current:0 };
      }
      return accum;
    }, allGames, {current:0, highest:0}, player).highest;

    let playerWithLongestWinstreak = StandardTournament.playerWithHighestMetric(highestWinstreakMetricFunction, allRosterPlayers);
    console.log(`\t Player with the longest winstreak: ${playerWithLongestWinstreak.players.map(player=>player.name).join(', ')} (${playerWithLongestWinstreak.highest})`);

    let highestDeltaT= Number.MIN_VALUE;
    let avgDeltaT = 0;
    allGames.forEach(game=>{
      if(game.deltaT>highestDeltaT)
        highestDeltaT = game.deltaT;
      avgDeltaT+=game.deltaT / allGames.length;
    });
    console.log('\t Longest game duration:', this.formatDeltaT(highestDeltaT) );
    console.log('\t Average game duration:', this.formatDeltaT(avgDeltaT) );
  }


  
  async printPersonalStats(){
    const Percent = new Intl.NumberFormat( 'en-US', {style:'percent', minimumFractionDigits:2, maximumFractionDigits:2} );
    let allGames = await this.getAllGames();
    let allMissions = StandardTournament.filterMissions((mission,player,gamePlayer)=>true, allGames);
    let allRosterPlayers = await this.getAllRosterPlayers();

    console.log('Individual Player Stats:')
    allRosterPlayers.forEach(player=>{
      console.log('Player: ', player.name);
      let allPlayerGames = StandardTournament.filterGames((game, player, gamePlayer)=>game.hasPlayer(player), allGames, player);
      let allPlayerMissions = StandardTournament.filterMissions((mission, player, gamePlayer)=>mission.hasPlayer(player),allPlayerGames,player);
      let allPlayerGamesWon = StandardTournament.filterGames((game, player, gamePlayer)=>game.didWin(player), allPlayerGames, player);
      console.log(`\t % winrate: ${Percent.format(allPlayerGamesWon.length / allPlayerGames.length)}`);

      let agentGames = StandardTournament.filterGames((game, player, gamePlayer)=>gamePlayer.role.name=="Agent", allPlayerGames, player);
      let numAgentGamesWon = StandardTournament.filterGames((game, player, gamePlayer)=>game.didWin(player), agentGames, player).length;
      console.log(`\t % agent winrate: ${Percent.format(numAgentGamesWon / agentGames.length)}`);
      
      let hackerGames = StandardTournament.filterGames((game, player, gamePlayer)=>gamePlayer.role.name=="Hacker", allPlayerGames, player);
      let numHackerGamesWon = StandardTournament.filterGames((game, player, gamePlayer)=>game.didWin(player), hackerGames, player).length;
      console.log(`\t % hacker winrate: ${Percent.format(numHackerGamesWon / hackerGames.length)}`);

      let all2ManMissionsWithPlayer = StandardTournament.filterMissions((mission, player, gamePlayer)=>mission.numPlayers==2 && mission.hasPlayer(player), allPlayerGames, player)
      
      let numHackergames = StandardTournament.filterGames((game, player, gamePlayer)=>gamePlayer.role.name=="Hacker", allPlayerGames, player);
      console.log(`\t Number of agent games: ${agentGames.length}`);
      console.log(`\t Number of hacker games: ${numHackergames.length}`);

      let numAllN1MissionsWithPlayer = allPlayerMissions.filter(mission=>mission.number==1).length;
      console.log(`\t Number of times you were in n1:${numAllN1MissionsWithPlayer}`);
      let numAllN2MissionsWithPlayer = allPlayerMissions.filter(mission=>mission.number==2).length;
      console.log(`\t Number of times you were in n2:${numAllN2MissionsWithPlayer}`);
      let numAllN3MissionsWithPlayer = allPlayerMissions.filter(mission=>mission.number==3).length;
      console.log(`\t Number of times you were in n3:${numAllN3MissionsWithPlayer}`);
      let numAllN4MissionsWithPlayer = allPlayerMissions.filter(mission=>mission.number==4).length;
      console.log(`\t Number of times you were in n4:${numAllN4MissionsWithPlayer}`);
      let numAllN5MissionsWithPlayer = allPlayerMissions.filter(mission=>mission.number==5).length;
      console.log(`\t Number of times you were in n5:${numAllN5MissionsWithPlayer}`);

      let allN1Missions = StandardTournament.filterMissions( (mission, player, gamePlayer)=>mission.number==1, allPlayerGames, player )
      let numAllN1MissionsWith2Agents = StandardTournament.filterMissions(
        (mission, player, gamePlayer)=>mission.number==1 && mission.gamePlayers.filter(gamePlayer=>gamePlayer.role.name == "Agent").length == mission.numPlayers,
        allPlayerGames,
        player
      ).length;
    console.log(`\t % of all games that you played that had 2 agents in n1: ${Percent.format(numAllN1MissionsWith2Agents/allN1Missions.length)}`);

    let num2ManNodesWithPlayerAsHacker = StandardTournament.filterMissions((mission, player, gamePlayer)=>mission.numPlayers==2 && mission.hasPlayer(player) && gamePlayer.role.name=="Hacker", allPlayerGames, player).length
    let num2ManNodesBluffedWithPlayerAsHacker = StandardTournament.filterMissions((mission, player, gamePlayer)=>mission.numPlayers==2 && mission.hasPlayer(player) && !mission.hacked && gamePlayer.role.name=="Hacker", allPlayerGames, player).length
    console.log(`\t % of 2 man nodes that you bluffed: ${Percent.format(num2ManNodesBluffedWithPlayerAsHacker/num2ManNodesWithPlayerAsHacker)}`);

    let playerOccurrenceObj={}
    let allPlayerGamesAsHacker = StandardTournament.filterGames((game, player, gamePlayer)=>gamePlayer.role.name=="Hacker", allPlayerGames, player)
    allPlayerGamesAsHacker.forEach(game=>{
      game.hackers.filter(hacker=>hacker.Steamid!=player.steamID).forEach(hackerPartner=>{
        if(!playerOccurrenceObj[hackerPartner.username])
          playerOccurrenceObj[hackerPartner.username] = 0;
        playerOccurrenceObj[hackerPartner.username]++;
      });
    });
    let usernameOfMostCommonHackerPartner = _.reduce(playerOccurrenceObj,(accum, numOccurrences, otherUsername)=>{
      if(numOccurrences > accum.mostOccurrences){
        accum.mostOccurrences = numOccurrences;
        accum.usernames = [otherUsername];
      }
      else if (numOccurrences === accum.mostOccurrences)
        accum.usernames.push(otherUsername);
      return accum;
    }, {usernames:[], mostOccurrences:0});
    console.log(`\t Hacker teammate(s) you were most often paired with: ${usernameOfMostCommonHackerPartner.usernames.join(', ')} (${usernameOfMostCommonHackerPartner.mostOccurrences})`);
    console.log(`\t Hacker teammates and their occurrences:`);
    console.log(`\t `, playerOccurrenceObj);

    console.log('\n');
    });
  }


  async printAllStats(){
    await this.printGlobalStats();
    // await this.printPersonalStats();
  }
}

function areAdjacent(slots, numPlayers){
  let minSlot = Number.MAX_VALUE;
  slots.forEach(slot=>{
    if( slot < minSlot)
      minSlot = slot;  
  });
  let otherSlots = slots.filter(slot=>slot!=minSlot);
  let adjacentSlots = [minSlot];
  let checkedAll = false;

  // console.log('initial', adjacentSlots, otherSlots)
  while(!checkedAll){
    let adjacentSlotsLen = adjacentSlots.length;
    for( let adjacentSlot of adjacentSlots ){
      let nextPositiveSlot = (adjacentSlot+1) % numPlayers;
      let nextNegativeSlot = (adjacentSlot-1) < 0 ? numPlayers-1 : (adjacentSlot-1);
      for(let i=otherSlots.length; i>=0; i--)
        if(otherSlots[i] == nextPositiveSlot || otherSlots[i] == nextNegativeSlot){
          // console.log('new adjacent:',otherSlots[i],'adjacent to:', adjacentSlot);
          adjacentSlots.push(otherSlots[i]);
          otherSlots.splice(i,1)
        }
    }
    if(adjacentSlots.length === adjacentSlotsLen)
      checkedAll = true;
  }
  return adjacentSlots.length == slots.length;
}

module.exports = { StandardTournament }