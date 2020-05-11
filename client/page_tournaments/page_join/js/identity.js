class Identity {
  constructor(data){
    if(!data.localPlayer)
      throw Error('No .localPlayer data was provided');
      if(!data.user)
      throw Error('No .user data was provided');
    this.localPlayer = data.localPlayer;
    this.user = data.user;
  }
}