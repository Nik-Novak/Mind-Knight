class Game {
  constructor(data){
    if(!data)
      throw Error('Game cannot be null');
    this.data = data;
  }

  get hacked(){ return this.data.game_end.Hacked };

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
    Object.entries(this.data.missions).forEach(([key, value])=>{
      console.log(`\t Node ${key}`)
      let proposerSlot = value.mission_phase_end.Proposer;
      console.log(`\t\t ProposedBy: ${this.getPlayerIdentity(proposerSlot).Nickname}(${this.data.players[proposerSlot].Username})`);
      console.log(`\t\t Result: ${value.mission_phase_end.Failed?`Hacked(${value.mission_phase_end.NumHacks})`:'Secured'}`);
      console.log(`\t\t PropIndex: ${value.mission_phase_end.propNumber-1}/5`);
    });
  }
}