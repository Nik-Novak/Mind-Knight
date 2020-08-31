//@ts-check
const os = require('os');
const util = require('util')
const path = require("path");
const fs = require('fs-extra');
const ip = require('ip');
const express = require('express');
const portastic = require('portastic');
const open = require('open');
const Tail = require('./modules/Tail.js');
const GameBuilder = require('./modules/GameBuilder.js');
const Database = require('./modules/Database.js').Database;
const { Version } = require('./modules/Version.js');
const { Test } = require('./modules/Test.js');
const { Manual } = require('./modules/Manual.js');
const { readCredsFromFile } = require('./modules/Creds');

const { Game } = require('data-wrappers/game');
const { Player } = require('data-wrappers/player');
const { StandardTournament } = require('data-wrappers/tournament');

const config = require('config');
const LOG_PATH = config.get('paths.log.prefix') + config.get('paths.log.path'); //`${process.env.USERPROFILE}/appdata/LocalLow/Nomoon/Mindnight/Player.log`

let app = express();
// @ts-ignore
let server = require('http').Server(app);
let io = require('socket.io')(server);

let store = {
  state: {
    lastEvent: null,
    gameInProgress: false,
  },
  game: null,
  identity: {
    user:null,
    player:null
  }
}

let gamebuilder = new GameBuilder();

const database = new Database(config.get('database'), {u:'client', p:readCredsFromFile('./au').client});
const version = new Version(config.get('version_url.local'), config.get('version_url.remote'));
const manual = new Manual(database);
const test = new Test(gamebuilder, database);

let portRange = config.get('port_range');
// @ts-ignore
portastic.find({
  min: portRange.min,
  max: portRange.max
})
.then(async function(ports){
  // console.log(database.readLogFile(path.join(process.env.APPDATA,"../LocalLow/Nomoon/Mindnight/Player.log"))); //TESTIng IF Log FILE IS BEING SOURCED
  const port = ports[0];


// ********* SERVER ROUTING *********

server.listen(port, ip.address());

console.log('\n*************************************** LAN MODE ***************************************');
console.log('LAN MODE ENABLED, to view the app on another device in your home/network please visit this address in your browser:', ip.address()+ ':'+port+'');
console.log('****************************************************************************************\n');
console.log('Welcome to Mind Knight, please visit ' + ip.address() + ':'+port+' in your browser (on any device in your network). If that does not work then please try visiting address localhost:'+port+' on this machine.');
// @ts-ignore
app.use( (req, res, next)=>{ //Any url not defined (or i guess final module to be used)
    console.log('Client requested:', req.originalUrl);
    next();
} );

app.get('/', (req, res)=>{
    res.send(200);
    // res.sendFile(__dirname + '/client/index.html');
});

app.post('/update', (req, res)=>{
    version.update();
    res.sendStatus(200);
});
app.post('/reinstall', (req, res)=>{
    version.reinstall();
    res.sendStatus(200);
});
app.get('/version', (req, res)=>{
  version.checkVersion()
    .then(result=>res.send(result))
    .catch(err=>res.send({local:'unknown', remote:'unknown'}))
});
app.get('/state', (req, res)=>{
  res.set({'Content-Type': 'application/json'});
  res.send(store.state);
});
app.get('/game', (req, res)=>{
  res.set({'Content-Type': 'application/json'});
  res.send(store.game);
});
app.get('/simulate', (req, res)=>{
    test.simulate();
    res.sendStatus(200);
});
app.get('/test', (req, res)=>{
    test.test();
    res.sendStatus(200);
});

app.get('/data/tournaments', async (req,res)=>{
    res.set({'Content-Type': 'application/json'});
    res.send(await database.getStandardTournaments({}))
});
app.get('/data/game', async (req,res)=>{
    res.set({'Content-Type': 'application/json'});
    res.send(await database.getGame(req.query))
});
app.get('/data/games', async (req,res)=>{
    res.set({'Content-Type': 'application/json'});
    res.send(await database.getGames(req.query))
});
app.get('/data/identity', async (req,res)=>{
    if(!store.identity.user || !store.identity.player){
      let identity = await database.login();
      store.identity.user = identity.user; store.identity.player = identity.player;
    }
    res.set({'Content-Type': 'application/json'});
    res.send(store.identity);
});

app.use( (req, res, next)=>{ //Any url not defined (or i guess final module to be used)
    res.writeHead( 404 );
    res.end();
} );


// ********* SOCKETS *********

io.on('connection', (socket)=>{
  log('Client socket connected');
  socket.emit('log', 'Server socket connected');

  socket.on('disconnect', function(socket) {
    console.log('Client socket disconnected.');
  });
});

// ********* Game Build *********
//Intro page
// @ts-ignore
gamebuilder.on('game_launch', (game)=>{
    store.state.lastEvent = 'game_launch';
    log('game_launch detected');
    database.resetCheckpoint();
    io.sockets.emit('game_launch', {state:store.state, game});
});
// @ts-ignore
gamebuilder.on('game_menu', (game)=>{
    if(!store.state.gameInProgress)
      store.game={};
    store.state.lastEvent = 'game_menu';
    log('game_menu detected');
    io.sockets.emit('game_menu', {state:store.state, game});
});
// @ts-ignore
gamebuilder.on('game_player_info', (packet)=>{
    store.state.lastEvent = 'game_player_info';
    log('game_player_info detected');
    io.sockets.emit('game_player_info', packet);
    database.login(packet.Steamid, packet.Nickname).then((loginDetails)=>{
      store.identity.user = loginDetails.user;
      store.identity.player = loginDetails.player;
    });
});
// @ts-ignore
gamebuilder.on('game_close', (game)=>{
  store.state.lastEvent = 'game_close';
  log('game_close detected');
  io.sockets.emit('game_close', {state:store.state, game});
});

//game page
// @ts-ignore
gamebuilder.on('game_start', (game)=>{
    store.state.lastEvent='game_start';
    store.game=game;
    store.gameInProgress = true;
    log('game_start detected');
    io.sockets.emit('game_start', {state:store.state, game});
});

// @ts-ignore
gamebuilder.on('game_selectPhaseEnd', (game)=>{
    store.state.lastEvent='game_selectPhaseEnd';
    store.game=game;
    log('game_selectPhaseEnd detected');
    io.sockets.emit('game_selectPhaseEnd', {state:store.state, game});
});

// @ts-ignore
gamebuilder.on('game_votePhaseEnd', (game)=>{
    store.state.lastEvent='game_votePhaseEnd';
    store.game=game;
    log('game_votePhaseEnd detected');
    io.sockets.emit('game_votePhaseEnd', {state:store.state, game});
});

// @ts-ignore
gamebuilder.on('game_missionPhaseEnd', (game)=>{
    store.state.lastEvent='game_missionPhaseEnd';
    store.game=game;
    log('game_missionPhaseEnd detected');
    io.sockets.emit('game_missionPhaseEnd', {state:store.state, game});
});

// @ts-ignore
gamebuilder.on('game_chatUpdate', (game)=>{
  store.state.lastEvent='game_chatUpdate';
  store.game=game;
  log('game_chatUpdate detected');
  io.sockets.emit('game_chatUpdate', {state:store.state, game});
});

// @ts-ignore
gamebuilder.on('game_end', (game)=>{
  console.log('Game End');
  store.state.lastEvent='game_end';
  store.gameInProgress = false;
  log('game_end detected');
  io.sockets.emit('game_end', {state:store.state, game});
  database.uploadGame(game, LOG_PATH);
});

// ********* PROCESS *********
let logContent = database.readLogFile(LOG_PATH).toString();
let lastGameEndIndex = logContent.lastIndexOf('Received GameEnd');
let resumeLogIndex = 0;
if(lastGameEndIndex !=-1) { //previous game was played, process everythign since then
  console.log('Resuming from last game_end with index:', resumeLogIndex);
  resumeLogIndex = logContent.indexOf(os.EOL, lastGameEndIndex);
  database.resetCheckpoint(resumeLogIndex);
}
gamebuilder.resumeFromLog(logContent, resumeLogIndex); //e
store.game = gamebuilder.getGame();

new Tail(LOG_PATH, gamebuilder.process).start();

// ********* MISC *********

function log(msg){
  console.log('[LOG]',msg);
}

// (await database.getGames({})).forEach(game=>{
//   let games = [];
//   let wrapper = new Game(game);
//   if(wrapper.hasPlayer(new Player({name:'Jemma', steamID:'76561199012217952'})) && wrapper.hasPlayer(new Player({name:'naseem_1378', steamID:'76561198799350618'})) && wrapper.hasPlayer(new Player({name:'2JZ 4U', steamID:'76561198073023481'})))
//     games.push(wrapper);
//   games.forEach(game=>console.log(game.data._id));
// })
// new Game( (await database.getGame({_id:'5ed48ba6f1aca8ae41c1c4ea'}))).printResults();

//********* Test stuff *********
// manual.manuallyCreateCV2020Tournament();

//************ RETROACTIVE GAME UPLOAD *************** */
//2: 03D40274-0435-05E4-BC06-7D0700080009
//k: 35673880-D7DA-11DD-8341-40167E68EA47
//p: EEB7D643-1666-884D-B59E-B8DC0C800AD8

// let rawGameID = '5ebcabcc41ddbc3df854f05f';
// manual.retroactiveBuildAndUploadRawGame('03D40274-0435-05E4-BC06-7D0700080009', {rawGameID});
//**************************************************** */

// **** PRINT GAME INFO *****
// let rawGameID = '5ebcabcc41ddbc3df854f05f';
// let games = await manual.buildRawGames({rawGameID});
// new Game(games[0]).printResults();

// let gameID = '5ed48ba6f1aca8ae41c1c4ea';
// let game = await database.getGame({_id:gameID});
// let gameWrapper = new Game(game.toObject());
// gameWrapper.printResults();

// let testPlayer = new Player( (await database.getPlayer({name:'2JZ 4U'})).toObject() );
// let testMissions = gameWrapper.filterMissions((mission, player, gamePlayer)=>mission.hasPlayer(player) && !mission.hacked, testPlayer);
// console.log(testMissions.length);
// **************************

// ****** Tournament *******
// let tournamentID = '5eccb12e055fd798ea2c8de4';
// let tournament = await database.getStandardTournament({_id:tournamentID});
// let tournamentWrapper = new StandardTournament(tournament, async (gameID)=>(await database.getGame({_id:gameID})).toObject(), async (playerID)=>(await database.getPlayer({_id:playerID})).toObject() );
// tournamentWrapper.printAllStats();
// *************************

// open('http://'+ip.address()+':'+port);

});

//TODO: Main menu detect exits game --should be done
//TODO: refresh exclamation marks on updates --should be done
//TODO: LAN/online mode --should be working
//TODO: Detailed target info

// console.log(JSON.parse('{"Type":205,"Message":"The FitnessGram™ Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer","Slot":4}'));