console.log('INIT socket.js');

const colors = {
    '0':{ name:'light-blue', hex:'#00A6F6' },
    '1':{ name:'magenta', hex:'#D31FD4' },
    '2':{ name:'light-green', hex:'#6FE015' },
    '3':{ name:'grey', hex:'#9D9D9D' },
    '4':{ name:'orange', hex:'#FF8113' },
    '5':{ name:'yellow', hex:'#FFEC16' },
    '6':{ name:'turquoise', hex:'#00B48B' },
    '7':{ name:'dark-blue', hex:'#0041F6' }
}

var socket = io.connect(window.location.origin); //connects to localhost:8080 in this case

var resetManager = new ResetManager();
var firstRun = true;

function init(){
    resetManager.resetAll();
    log('Interface reset complete');
}
init();

function update(updatedGame){
    game=updatedGame;
    game.missions=game.missions || {};

    if($('.node-container div.round-button.selected').length>0)
        $('.node-container div.round-button.selected').click();

    if(!firstRun)
        return;
    //set missions
    setNodeStatuses(updatedGame);
    setChat(updatedGame);
    //set names
    Object.keys(updatedGame.players).forEach(key => {
        let nameElement = $('.player-container[index='+key+'] .player-name p');
        nameElement.html(updatedGame.players[key].Username);
        nameElement.css('color', colors[updatedGame.players[key].Color].hex);
    });
    $('#interchangeable-css').attr('href', "css/"+updatedGame.game_found.PlayerNumber+"man.css");
    let i=0;
    game.game_found.MissionInfo.forEach(numPlayers=>{
        i++;
        $('.node-container div.round-button[index='+i+'] a.round-button').html(numPlayers);
    });
    firstRun=false;
}

function updateChat(msg) {
    let header = coloredTextSpan(game.players[msg.Slot].Username, colors[game.players[msg.Slot].Color].hex).trim();
    if($('#chat-log ul').children().last().attr('index') != msg.id)
        $('#chat-log ul').append($( '<li index="'+msg.id+'">[<span class="header">'+header+'</span>]: '+msg.Message+'</li>' ));
}

socket.on('game_start', (updatedGame)=>{
    log('game_start');
    console.log(updatedGame);
    log(updatedGame.game_found.PlayerNumber + ' Players were detected. Loading appropriate layout');
    //TODO player # specific css selection and node naming, etc. Found in game.game_found
    update(updatedGame);
});

socket.on('game_selectPhaseEnd', (updatedGame)=>{
    log('game_selectPhaseEnd');
    console.log(updatedGame);
    update(updatedGame);
});

socket.on('game_votePhaseEnd', (updatedGame)=>{
    log('game_votePhaseEnd');
    console.log(updatedGame);
    update(updatedGame);

    log('game_chatUpdate'); //ToDO: remove
    game=updatedGame;
    let msg = game.chat[game.chat.length-1];
    updateChat(msg);
});

socket.on('game_missionPhaseEnd', (updatedGame)=>{
    log('game_missionPhaseEnd');
    console.log(updatedGame);
    setNodeStatuses(updatedGame);     //set missions
    update(updatedGame);
});

socket.on('game_menu', (updatedGame)=>{
    log('game_menu');
    game={};
    window.location.replace(window.location.origin);
});

socket.on('game_chatUpdate', (updatedGame)=>{
    log('game_chatUpdate');
    game=updatedGame;
    let msg = game.chat[game.chat.length-1];
    updateChat(msg);
});

socket.on('log', (message)=>{
    log(message, true);
});

function setNodeStatuses(updatedGame){
    if(updatedGame)
    Object.keys(updatedGame.missions).forEach( missionKey=>{
        let hacked = updatedGame.missions[missionKey].mission_phase_end.Failed;
        let node = $('.node-container .round-button[index='+missionKey+'] .round-button-circle');
        if(hacked)
            node.attr('status', 'hacked');
        else
            node.attr('status', 'secured');
    });
}

function setChat(updatedGame){
    if(!updatedGame.chat)
        return;
    updatedGame.chat.forEach((msg)=>{
        updateChat(msg);
    });
}

function simulate(){
    console.log('requesting server simulates');
    socket.emit('simulate', 'test');
}

function coloredTextSpan(text, color){
    return '<span style="color:' + color + '">' + text + '</span> ';
}

function log(msg, fromServer=false){
    console.log('[LOG]', msg);
    let logMsg = $('<li>'+(fromServer ? '[SERVER] ' : '[LOG] ') + msg.toString()+'</li>');
    $('#debug-log ul').append(logMsg);
}

