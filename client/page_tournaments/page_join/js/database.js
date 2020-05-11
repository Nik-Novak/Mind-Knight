
//@ts-check
class Database {
  constructor(dbURL){
    this.dbURL = dbURL;
  }

  async getGameByID(gameID){
    let games = (await this.makeRequest(`/data/games?_id=${gameID}`));
    return new Game(games[0]);
  }

  async makeRequest(uri, options={}){ 
    let defaultOptions = {headers:{'Accept': 'application/json'}};
    let requestOptions = {...options};
    Object.assign(requestOptions, defaultOptions); //apply defaults
    let result = await fetch(this.dbURL + uri, requestOptions);
    if(result.status !== 200){
      alert('Something went wrong while communicating with the server. please refresh. ' +  result.status + ' ' +  result.statusText);
      return;
    }
    return await result.json();
  }

  /**
   * @returns {Promise<[Tournament]>}
   */
  async getTournaments(){
    let tournaments = await this.makeRequest('/data/tournaments');
    tournaments = tournaments.map(rawTournament=>new Tournament(rawTournament));
    return tournaments;
  }

  async getIdentity(){
    return new Identity(await this.makeRequest('/data/identity'));
  }

}