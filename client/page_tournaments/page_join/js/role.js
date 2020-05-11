class Role {
  constructor(roleID){
    this.roleID = roleID;
  }
  get name(){
    const idToNameMap = {
      10: 'Agent',
      20: 'Hacker'
    }
    return idToNameMap[this.roleID];
  }
}