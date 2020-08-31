
class Player {
  constructor(data){
    this.data = data;
  }
  get name(){ return this.data.name }
  get steamID(){ return this.data.steamID }
}

module.exports = { Player }