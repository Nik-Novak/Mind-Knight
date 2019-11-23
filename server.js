var path = require("path");
var fs = require('fs-extra');
var express = require('express');
const Tail = require('./custom_modules/Tail.js');
const GameBuilder = require('./custom_modules/GameBuilder.js');
var Database = require('./custom_modules/Database.js').Database;
var Updater = require('./custom_modules/Updater.js').Updater;
var request = require('request');

//const LOGPATH = "$Env:USERPROFILE/appdata/LocalLow/Nomoon/Mindnight/output_log.txt";

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ip = require('ip');

var gamebuilder = new GameBuilder();
var gameStarted = false;
var lastState;
var lastGame;

var database = new Database();
var updater = new Updater();

// ********* SERVER ROUTING *********
//server.listen(8080); //server.listen(8080, '192.168.1.109'); //LAN MODE
server.listen(8080, ip.address());
//console.log(process.env);

//*********TEST*****************
//database.uploadGame(path.join(process.env.APPDATA,"../LocalLow/Nomoon/Mindnight/output_log.txt"));
//******************************


for(let i=0; i<10; i++)
    console.log('LAN MODE ENABLED, to view the app on another device in yout home/network please visit this address in your browser:', ip.address()+ ":8080");
console.log('Welcome to Mind Knight, please visit ' + ip.address() + ':8080 in your browser (on any device in your network). If that does not work then please try visiting address localhost:8080 on this machine.');
app.use( (req, res, next)=>{ //Any url not defined (or i guess final module to be used)
    console.log('Client requested:', req.originalUrl);
    next();
} );

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/update', (req, res)=>{
    res.sendFile(__dirname + '/client/page_update/index.html');
});

app.get('/game', (req, res)=>{
    if(!gameStarted)
        res.redirect('/');
    else
        res.sendFile(__dirname + '/client/page_game/index.html');
});

app.get('/test', (req, res)=>{
    res.writeHead( 200, {"Content-Type": "text/html"} );
    res.end('<p>Here is a paragraph of <strong>HTML</strong>! This is the test directory</p>');
});

app.use(express.static(__dirname + '/client')); //Serves ALL static resources from public folder

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
       simulate(socket);
    });
    var fromURL = socket.client.request.headers.referer;
    if(gameStarted) {
        io.sockets.emit('game_inProgress');
        if(fromURL == 'http://localhost:8080/')
        return;
    }

    if(lastState)
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

new Tail("$Env:USERPROFILE/appdata/LocalLow/Nomoon/Mindnight/Player.log", gamebuilder.process.bind(gamebuilder)).tail();

// ********* Game Build *********
//Intro page
gamebuilder.on('game_launch', (game)=>{
    lastState = 'game_launch';
    log('game_launch detected');
    io.sockets.emit('game_launch');
    database.resetCheckpoint();
});
gamebuilder.on('game_menu', (game)=>{
    game={};
    lastGame={};
    lastState = 'game_menu';
    log('game_menu detected');
    io.sockets.emit('game_menu');
});
gamebuilder.on('game_close', (game)=>{
    log('game_close detected');
    io.sockets.emit('game_close');
});

//game page
gamebuilder.on('game_start', (game)=>{
    lastState='game_start';
    lastGame=game;
    gameStarted = true;
    log('game_start detected');
    io.sockets.emit('game_start', game);
});

gamebuilder.on('game_selectPhaseEnd', (game)=>{
    lastState='game_selectPhaseEnd';
    lastGame=game;
    log('game_selectPhaseEnd detected');
    io.sockets.emit('game_selectPhaseEnd', game);
});

gamebuilder.on('game_votePhaseEnd', (game)=>{
    lastState='game_votePhaseEnd';
    lastGame=game;
    log('game_votePhaseEnd detected');
    io.sockets.emit('game_votePhaseEnd', game);
});

gamebuilder.on('game_missionPhaseEnd', (game)=>{
    lastState='game_missionPhaseEnd';
    lastGame=game;
    log('game_missionPhaseEnd detected');
    io.sockets.emit('game_missionPhaseEnd', game);
});

gamebuilder.on('game_end', (game)=>{
    lastState='game_end';
    gameStarted = false;
    log('game_end detected');
    io.sockets.emit('game_end', game);
    database.uploadGame(path.join(process.env.APPDATA,"../LocalLow/Nomoon/Mindnight/Player.log"));
});

gamebuilder.on('game_chatUpdate', (game)=>{
    lastState='game_chatUpdate';
    lastGame=game;
    log('game_chatUpdate detected');
    io.sockets.emit('game_chatUpdate', game);
});


//********* Simulate Game *********
function simulate(socket){
    // let simFile = 'output_log_beforeGameEnd.txt'; //WORKS PERFECTLY, game 2 folder
    let simFile = 'output_log.txt'//'output_log_beforeGameEnd.txt';
    var lineReader = require('readline').createInterface({
        input: fs.createReadStream('./sample_games/Game 6/Mindnight/'+simFile)
    });

    lineReader.on('line', function (line) {
        if(line.length===0)
            return;
        console.log();
        gamebuilder.process(line.trim(), socket);
    });
}


// ********* MISC *********

function checkUpdate(){
    return new Promise( (resolve, reject) =>{
        fs.readFile('mindknight.version', 'utf-8',(err, local) => {
            if (err) {
                console.log('[ERROR] failed to read version file.')
                local = 'unknown';
            };
            let versionURL = 'https://raw.githubusercontent.com/Nik-Novak/Mind-Knight/master/mindknight.version';
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

var opn = require('opn');
opn('http://'+ip.address()+':8080');


//TODO: Main menu detect exits game --should be done
//TODO: refresh exclamation marks on updates --should be done
//TODO: LAN/online mode --should be working
//TODO: Detailed target info