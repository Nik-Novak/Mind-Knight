//@ts-check
const util = require('util')
var path = require("path");
var fs = require('fs-extra');
const _ = require('lodash');
var express = require('express');
const portastic = require('portastic');
const opn = require('opn');
const Tail = require('./custom_modules/Tail.js');
const GameBuilder = require('./custom_modules/GameBuilder.js');
var Database = require('./custom_modules/Database.js').Database;
var Updater = require('./custom_modules/Updater.js').Updater;
const { readCredsFromFile } = require('./custom_modules/Creds');
var request = require('request');


// const LOGPATH = "$Env:USERPROFILE/appdata/LocalLow/Nomoon/Mindnight/output_log.txt";

var app = express();
// @ts-ignore
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ip = require('ip');

var gamebuilder = new GameBuilder();
var gameStarted = false;
var lastState;
var lastGame;
let user, localPlayer;

var database = new Database('mongodb+srv://mind-knight-oxzpw.gcp.mongodb.net/production?retryWrites=true&w=majority', {u:'client', p:readCredsFromFile('./au').client});
var updater = new Updater();

// @ts-ignore
portastic.find({
  min: 8080,
  max: 8180
})
.then(function(ports){
  console.log(database.readLogFile());
  const port = ports[0];


// ********* SERVER ROUTING *********
//server.listen(8080); //server.listen(8080, '192.168.1.109'); //LAN MODE

// ********* Overwrite console log to output to file ***********
// new Logger().cloneOutputToFile('./logs/debug.log', { wipe:true });

server.listen(port, ip.address());

//console.log(process.env);

//*********TEST*****************
//database.uploadGame(path.join(process.env.APPDATA,"../LocalLow/Nomoon/Mindnight/output_log.txt"));
//******************************


console.log('\n*************************************** LAN MODE ***************************************');
console.log('LAN MODE ENABLED, to view the app on another device in your home/network please visit this address in your browser:', ip.address()+ ':'+port+'');
console.log('****************************************************************************************\n');
console.log('Welcome to Mind Knight, please visit ' + ip.address() + ':'+port+' in your browser (on any device in your network). If that does not work then please try visiting address localhost:'+port+' on this machine.');
// @ts-ignore
app.use( (req, res, next)=>{ //Any url not defined (or i guess final module to be used)
    console.log('Client requested:', req.originalUrl);
    next();
} );

// @ts-ignore
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/client/index.html');
});

// @ts-ignore
app.get('/update', (req, res)=>{
    res.sendFile(__dirname + '/client/page_update/index.html');
});
// @ts-ignore
app.get('/tournaments', (req, res)=>{
  res.sendFile(__dirname + '/client/page_tournaments/index.html');
});
app.get('/tournaments/join', (req, res)=>{
  res.sendFile(__dirname + '/client/page_tournaments/page_join/index.html');
});
// @ts-ignore
app.get('/replays', (req, res)=>{
    res.sendFile(__dirname + '/client/page_replays/index.html');
});
// @ts-ignore
app.get('/game', (req, res)=>{
    if(!gameStarted)
        res.redirect('/');
    else
        res.sendFile(__dirname + '/client/page_game/index.html');
});

app.get('/data/tournaments', async (req,res)=>{
    res.set({'Content-Type': 'application/json'});
    res.send(await database.getStandardTournaments())
});
app.get('/data/games', async (req,res)=>{
    res.set({'Content-Type': 'application/json'});
    res.send(await database.getGames(req.query))
});
app.get('/data/identity', async (req,res)=>{
    if(!user || !localPlayer){
      let identity = await database.login();
      user = identity.user; localPlayer = identity.localPlayer;
    }
    res.set({'Content-Type': 'application/json'});
    res.send({user, localPlayer});
});

// @ts-ignore
app.get('/test', (req, res)=>{
    res.writeHead( 200, {"Content-Type": "text/html"} );
    res.end('<p>Here is a paragraph of <strong>HTML</strong>! This is the test directory</p>');
});

// app.use('/', express.static(__dirname + '/client')); //Serves ALL static resources from public folder
// app.use('/update', express.static(__dirname + '/client/page_update'));
// app.use('/game', express.static(__dirname + '/client/page_game'));
app.use('/tournaments', express.static(__dirname + '/client/page_tournaments'));
app.use('/tournaments/join', express.static(__dirname + '/client/page_tournaments/page_join'));
app.use( express.static(__dirname + '/client'));


// @ts-ignore
app.use( (req, res, next)=>{ //Any url not defined (or i guess final module to be used)
    res.writeHead( 404 );
    res.end();
} );


// ********* SOCKETS *********

io.on('connection', (socket)=>{
    log('Client socket connected');
    socket.emit('log', 'Server socket connected');
    
    socket.on('simulate', ()=>{
      console.log('Client asked for simulated data');
      simulate();
    });
    socket.on('test', ()=>{
      console.log('Client requested a test');
      test();
    });
    var fromURL = socket.client.request.headers.referer;
    if(gameStarted) {
        io.sockets.emit('game_inProgress');
        if(fromURL == 'http://localhost:'+port+'/')
        return;
    }

    if(lastState)
        // @ts-ignore
        gamebuilder.emit(lastState, lastGame);

    checkUpdate().then(versionData=>{
        if (versionData.current == versionData.local){
            console.log('Your version is up to date!');
            socket.emit('version_uptodate', versionData);
        }
        else {
            console.log('Your MindKnight version is out of date. You\'re running: v'+versionData.local+', while the latest version is v', versionData.current);
            socket.emit('version_expired', versionData);
        }
    });
    
    socket.on('update', ()=>{
        updater.update();
    });
});

io.on('disconnect', function(socket) {
        console.log('Client socket disconnected.');
        socket.emit('log', 'Disconnected from server socket');
    });

// ********* TAIL *********
//C:/Users/nnova/AppData/LocalLow/Nomoon/Mindnight/output_log.txt

new Tail(`${process.env.USERPROFILE}/appdata/LocalLow/Nomoon/Mindnight/Player.log`, gamebuilder.process.bind(gamebuilder)).tail();//new Tail("$Env:USERPROFILE/appdata/LocalLow/Nomoon/Mindnight/Player.log", gamebuilder.process.bind(gamebuilder)).tail();

// ********* Game Build *********
//Intro page
// @ts-ignore
gamebuilder.on('game_launch', (game)=>{
    lastState = 'game_launch';
    log('game_launch detected');
    io.sockets.emit('game_launch');
    database.resetCheckpoint();
});
// @ts-ignore
gamebuilder.on('game_menu', (game)=>{
    game={};
    lastGame={};
    lastState = 'game_menu';
    log('game_menu detected');
    io.sockets.emit('game_menu');
});
// @ts-ignore
gamebuilder.on('game_player_info', (packet)=>{
    lastState = 'game_player_info';
    log('game_player_info detected');
    io.sockets.emit('game_player_info', packet);
    database.login(packet.Steamid, packet.Nickname).then((loginDetails)=>{
      user = loginDetails.user;
      localPlayer = loginDetails.localPlayer;
    });
});
// @ts-ignore
gamebuilder.on('game_close', (game)=>{
    log('game_close detected');
    io.sockets.emit('game_close');
});

//game page
// @ts-ignore
gamebuilder.on('game_start', (game)=>{
    lastState='game_start';
    lastGame=game;
    gameStarted = true;
    log('game_start detected');
    io.sockets.emit('game_start', game);
});

// @ts-ignore
gamebuilder.on('game_selectPhaseEnd', (game)=>{
    lastState='game_selectPhaseEnd';
    lastGame=game;
    log('game_selectPhaseEnd detected');
    io.sockets.emit('game_selectPhaseEnd', game);
});

// @ts-ignore
gamebuilder.on('game_votePhaseEnd', (game)=>{
    lastState='game_votePhaseEnd';
    lastGame=game;
    log('game_votePhaseEnd detected');
    io.sockets.emit('game_votePhaseEnd', game);
});

// @ts-ignore
gamebuilder.on('game_missionPhaseEnd', (game)=>{
    lastState='game_missionPhaseEnd';
    lastGame=game;
    log('game_missionPhaseEnd detected');
    io.sockets.emit('game_missionPhaseEnd', game);
});

// @ts-ignore
gamebuilder.on('game_end', (game)=>{
    lastState='game_end';
    gameStarted = false;
    log('game_end detected');
    io.sockets.emit('game_end', game);
    database.uploadGame(game, path.join(process.env.APPDATA,"../LocalLow/Nomoon/Mindnight/Player.log"));
    // fs.writeFileSync('./test.txt',JSON.stringify(game))
});

// @ts-ignore
gamebuilder.on('game_chatUpdate', (game)=>{
    lastState='game_chatUpdate';
    lastGame=game;
    log('game_chatUpdate detected');
    io.sockets.emit('game_chatUpdate', game);
});


//********* Simulate Game *********
function simulate(){
    // let simFile = 'output_log_beforeGameEnd.txt'; //WORKS PERFECTLY, game 2 folder
    let simFile = './sample_games/kain_day2_heat1.log';//'./sample_games/Game 7/Mindnight/Player_beforeGameEnd.log'; // './sample_games/TM symbol crashing - Player.log' //'output_log_afterGameEnd.log'//'output_log_beforeGameEnd.txt'//'output_log.txt'//'output_log_beforeGameEnd.txt';
    var lineReader = require('readline').createInterface({
        input: fs.createReadStream(simFile)
    });
    let lines = [];
    lineReader.on('line', function (line) {
        if(line.length===0)
            return;
        lines.push(line);
    });
    setInterval(function(){
        let line = lines.shift();
        if(!line){
            clearInterval(this);
            return;
        }
        // console.log('Line:', line);
        gamebuilder.process(line);
    }, 5);
}


// ********* MISC *********

function checkUpdate(){
    // @ts-ignore
    return new Promise( (resolve, reject) =>{
        fs.readFile('mindknight.version', 'utf-8',(err, local) => {
            if (err) {
                console.log('[ERROR] failed to read version file.')
                local = 'unknown';
            };
            let versionURL = 'https://raw.githubusercontent.com/Nik-Novak/Mind-Knight/master/mindknight.version';
            // @ts-ignore
            request(versionURL, function (error, response, current) {
                //console.log('('+local+ ', ' + current+')');
                resolve({local:local, current:current});
            });
        });
    });
}

function log(msg){
    console.log('[LOG]',msg);
}

//********* Test stuff *********
/**
 * FIXING ACCIDENTAL DELETION OF KAIN: { "o" : { "$v" : 1, "$set" : { "gameIDs.5" : ObjectId("5ebb7e046ca4d532d8f72720"), "raw_gameIDs.5" : ObjectId("5ebb7e016ca4d532d8f7271f") } } }
{ "o" : { "$v" : 1, "$set" : { "gameIDs.6" : ObjectId("5ebb846e6ca4d532d8f72d01"), "raw_gameIDs.6" : ObjectId("5ebb846d6ca4d532d8f72d00") } } }
{ "o" : { "$v" : 1, "$set" : { "gameIDs.7" : ObjectId("5ebc07f1c424a7b7686f8c5e"), "raw_gameIDs.7" : ObjectId("5ebc07f1c424a7b7686f8c5d") } } }
 Kains old ID: ObjectId("5eb77fef3db8853cc8e9e1be")

 JUNK kain games, delete all references later:
 ObjectId("5ebc21b7fbc510bf58ef20e7"), 
        ObjectId("5ebc256e606152c390b4b69e"), 
        ObjectId("5ebc27028b829eae081f7af8"), 
        ObjectId("5ebc27fdd65d658884defa39"), 
        ObjectId("5ebc290fbdf875c028e82a59"),
  JUNK kain RawGames, delete all references later:

  ObjectId("5ebc21b7fbc510bf58ef20e6"), 
        ObjectId("5ebc256d606152c390b4b69d"), 
        ObjectId("5ebc27018b829eae081f7af7"), 
        ObjectId("5ebc27fbd65d658884defa38"), 
        ObjectId("5ebc290dbdf875c028e82a58"), 
        ObjectId("5ebc2a24883e7aa24074b1ad"), 
        ObjectId("5ebc2a4e883e7aa24074b528"),
 */

async function test(){
  // let kain = await database.getOrCreatePlayer('76561198027955330', 'Kain42link42');
  // database.test();
  // testBuildingRawGameFromDB();
}
test();

async function fixDeletedUser(kain){
  const { Player } = require('./custom_modules/models/Player');
  let allGames = (await database.getGames({}));
  let brokenLinkGames = [];
  let kainGames = [];
  allGames.forEach(async game=>{
    for(let playerIdentity of game.game_end.PlayerIdentities){
      if(playerIdentity.Nickname=='Kain42link42'){
        kainGames.push(game);
        // Player.updateOne({_id:kain._id}, {$push:{gameIDs:game._id, raw_gameIDs:game.raw_gameID}})
      }
      // let player = await database.getPlayer({ name:playerIdentity.Nickname, gameIDs:game._id });
      // if(!player){
      //   console.log('FOUND BROKEN LINK GAME:', game._id);
      //   console.log('BROKEN FOR PLAYER:', playerIdentity.Nickname);
      //   brokenLinkGames.push(game);
      // }
    };
  });
  kainGames=kainGames.sort((a,b)=>new Date(a.game_start.timestamp).getTime() - new Date(b.game_start.timestamp).getTime());
  // kainGames.forEach(async game=>await Player.updateOne({_id:kain._id}, {$push:{gameIDs:game._id, raw_gameIDs:game.raw_gameID}}))
}

async function testBuildingRawGameFromFile(){
  // database.test();
  let log = fs.readFileSync('./sample_games/tourny_day1_heat3_pace.log').toString();
  let testGameBuilder = new GameBuilder();
  let games = testGameBuilder.buildGamesFromLog(log);
  console.log(games);
}

async function testBuildingRawGameFromDB(){
  let testGameBuilder = new GameBuilder();
  // let game = await database.getGame({_id:'5eb8e0f104515830c49cd405'});
  let rawGame = await database.getRawGame({_id:'5eb8e77004515830c49cd406'});
  let startPoint = rawGame.data.indexOf('Received GameFound') - 50;
  let games = testGameBuilder.buildGamesFromLog(rawGame.data, startPoint);
  games.forEach(game=>{
    console.log('\n\n\n')
    new Game(game).printResults();
  })
  fs.writeFileSync('./test.log', util.inspect(games,false,null));
}

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
      console.log(`\t\t propIndex: ${value.mission_phase_end.propNumber-1}/5`);
    });
  }
}

opn('http://'+ip.address()+':'+port);

});


//TODO: Main menu detect exits game --should be done
//TODO: refresh exclamation marks on updates --should be done
//TODO: LAN/online mode --should be working
//TODO: Detailed target info

// console.log(JSON.parse('{"Type":205,"Message":"The FitnessGram™ Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer","Slot":4}'));

