console.log('INIT client.js');

//FIX MODULO FOR NEGATIVE NUMBERS... tsk tsk javascript


//****LEFT****
$('.log-title').click(function(event){
    let chat = $(this).next().toggle();
});

//****CENTER****

var turnClick = function(event){
    resetManager.resetActionExistsIcon();
    $('.turn-container div.round-button').removeClass('selected');
    $(this).addClass('selected');
    let turnNumber = $(this).attr('index');
    $('.turn-number').html(numSuffix(turnNumber));

    //refresh display
    let nodeNum = $('.node-container div.round-button.selected').attr('index');
    let turnNum = $('.turn-container .round-button.selected').attr('index');
    let playerIndex = $('.player-container.selected').attr('index');
    displayTurn(nodeNum, turnNum, playerIndex)

    //exclamations
    setActionExists(nodeNum, turnNum);
}
$('.turn-container div.round-button').click(turnClick); //Node click handler

//TODO: add proper information on enter
$('.player-img').hover((event)=>{ //mouse enter
    if(!$('#option_showAdvanced').prop('checked'))
        return;
    $('.advanced-target-container').addClass('opaque');
}, (event)=>{ //mouse leave
    if(!$('#option_showAdvanced').prop('checked'))
        return;
    $('.advanced-target-container').removeClass('opaque');
});

$('.player-img').click(function(event){
    // $('.player-container.selected').removeClass('selected');
    // $(this).parent().addClass('selected');
    let playerIndex = $(this).parent().attr('index');
    let nodeNum = $('.node-container div.round-button.selected').attr('index');
    let turnNum = $('.turn-container .round-button.selected').attr('index');
    displayTurn(nodeNum, turnNum, playerIndex);
});

function displayTurn(nodeNum, turnNum, playerIndex, display=true){
    if(display) {
        resetManager.resetPlayerHighlights();
        resetManager.resetHammerIcon();
        resetManager.resetVoteIcon();
        resetManager.resetPlayerSelects();
        resetManager.resetNodeRejects();
        resetManager.resetImportantInfo();
    }
    // console.log(nodeNum, turnNum, playerIndex); //debug
    if(nodeNum===undefined || playerIndex===undefined || turnNum===undefined || !game.players[playerIndex].missions || !game.players[playerIndex].missions[nodeNum] ||!game.players[playerIndex].missions[nodeNum][turnNum-1] )
        return;
    // console.log(playerIndex, nodeNum, turnNum-1);
    let turnInfo = game.players[playerIndex].missions[nodeNum][turnNum-1];
    if(!turnInfo || turnInfo.Proposer===undefined) //never propped or in teh middle of propping
        return;

    //both props and passes get this
    let hammerPlayerIndex;
    if(display) {
        let propIndex = ( turnInfo.Passed ? turnInfo.propNumber-2 : turnInfo.propNumber-1 ); //IMPORTANT CONVERSION FOR PROP TRANSITION
        hammerPlayerIndex =  ( (4-propIndex) + parseInt(playerIndex) ) % parseInt(game.game_found.PlayerNumber); //IMPORTANT: hammer is who they pass it to

        $('.player-container[index='+hammerPlayerIndex+'] i.hammer-icon').removeClass('hidden');
        $('.important-info .left .proposer').html(game.players[turnInfo.Proposer].Username).css('color', colors[game.players[turnInfo.Proposer].Color].hex);
        $('.important-info .left p, .important-info .right p').removeClass('hidden');
        $('.player-container[index=' + playerIndex + ']').addClass('selected');
    }

    if(turnInfo.Passed){ //PASS LOGIC
        //TODO: pass logic

        if(display) {
            $('.important-info .right .action').html('passed hammer');
            let fromPlayerIndex = trueMod(hammerPlayerIndex-1,parseInt(game.game_found.PlayerNumber));
            let fromPlayer = coloredTextSpan(game.players[fromPlayerIndex].Username, colors[game.players[fromPlayerIndex].Color].hex);
            let toPlayer = coloredTextSpan(game.players[hammerPlayerIndex].Username, colors[game.players[hammerPlayerIndex].Color].hex)
            $('.important-info .right .targets').html('from ' + fromPlayer + ' to ' + toPlayer);
        }
        return 'pass';
    }

    //PROP LOGIC
    if(display) {
        $('.important-info .right .action').html('proposed');
        var targetString = "";
        turnInfo.SelectedTeam.forEach(playerNum => { //highlights
            $('.player-container[index=' + playerNum + ']').addClass('highlighted');
            let playerColor = colors[game.players[playerNum].Color].hex;
            targetString += coloredTextSpan(game.players[playerNum].Username, playerColor);
        });
        $('.important-info .right .targets').html(targetString.trim());
        $('.noderejects-container span').html(turnInfo.propNumber - 1);

        if(!turnInfo.vote_phase_end) //votes may not exist yet
            return;
        turnInfo.vote_phase_end.VotesFor.forEach(playerKey=>{
            $('.player-container[index='+playerKey+'] i.vote-icon').addClass('fa-check');
        });
        turnInfo.vote_phase_end.VotesAgainst.forEach(playerKey=>{
            $('.player-container[index='+playerKey+'] i.vote-icon').addClass('fa-times');
        });
    }

    return 'prop';

}

//****RIGHT****
//TODO: add proper information on enter
$('.node-container div.round-button-circle').hover(function(event){ //mouse enter
    if(!$('#option_showAdvanced').prop('checked'))
        return;
    if($(this).attr('status') === 'unknown')
        return;

    let nodeNum=$(this).parent().attr('index');
    let participants = game.missions[nodeNum].mission_phase_start.Players;
    let numParticipants = participants.length;
    let proposedBy = game.missions[nodeNum].mission_phase_end.Proposer;
    let propNumber = game.missions[nodeNum].mission_phase_end.propNumber;
    let refusedBy = '(todo)';
    let result = ( game.missions[nodeNum].mission_phase_end.Failed ? 'HACKED' : 'SECURED' );
    let numHackers = game.missions[nodeNum].mission_phase_end.NumHacks;
    let missionLength = game.missions[nodeNum].mission_phase_end.deltaT;

    let participantsHTML = "";
    participants.forEach(participantKey => {
        let playerColor = colors[game.players[participantKey].Color].hex;
        participantsHTML += coloredTextSpan(game.players[participantKey].Username, playerColor);
    });

    let table = $('.content-right table.advanced-node-container');
    table.find('.node-number').html(nodeNum);
    table.find('.node-participants-number').html(numParticipants);
    table.find('.node-participants').html(participantsHTML);
    table.find('.node-proposer').html(coloredTextSpan(game.players[proposedBy].Username, colors[game.players[proposedBy].Color].hex));
    table.find('.prop-number').html(propNumber);
    table.find('.node-refusers').html(refusedBy);
    table.find('.node-result').html(result);
    table.find('.node-num-hackers').html(numHackers);
    table.find('.node-time').html(missionLength/1000);

    // if(result==='SECURED') //TODO: fix nodisp making even/odd rows match colour
    //     table.find('.node-num-hackers').parent().addClass('nodisp');
    // else
    //     table.find('.node-num-hackers').parent().removeClass('nodisp');

    $('.advanced-node-container').addClass('opaque');
}, (event)=>{ //mouse leave
    if(!$('#option_showAdvanced').prop('checked'))
        return;
    $('.advanced-node-container').removeClass('opaque');
});

$('.node-container div.round-button').click(function(event){
    resetManager.resetActionExistsIcon();
    $('.node-container div.round-button').removeClass('selected');
    $(this).addClass('selected');
    let nodeNum = $(this).attr('index');
    $('.node-number').html(nodeNum);

    resetManager.resetTurns();

    var numTurns=0;
    Object.keys(game.players).forEach( key=>{
        // console.log(game.players[key].missions , game.players[key].missions[nodeNum] , game.players[key].missions[nodeNum].length > numTurns , game.players[key].missions[nodeNum].length , numTurns);
        if(game.players[key].missions && game.players[key].missions[nodeNum] && game.players[key].missions[nodeNum].length > numTurns)
            numTurns=parseInt(game.players[key].missions[nodeNum].length);
    });

    for(let i=1; i<numTurns; i++){
        var tmp = $('.turn-container').children().first().clone();
        tmp.removeClass('hidden');
        tmp.removeClass('selected');
        tmp.attr('index', i+1);
        $('.turn-container').append(tmp);
    }
    if(numTurns!=0)
        $('.turn-container').children().first().removeClass('hidden').addClass('selected');
    $('.turn-container div.round-button').off('click').click(turnClick);

    //refresh display
    let playerIndex = $('.player-container.selected').attr('index');
    let turnNum = $('.turn-container .round-button.selected').attr('index');
    displayTurn(nodeNum, turnNum, playerIndex);

    //exclamations
    setActionExists(nodeNum, turnNum);
});

function coloredTextSpan(text, color){
    return '<span style="color:' + color + '">' + text + '</span> ';
}

function setActionExists(nodeNum, turnNum){
    Object.keys(game.players).forEach( playerKey=>{
        if(displayTurn(nodeNum, turnNum, playerKey, false)!=undefined)
            $('.player-container[index='+playerKey+'] i.action-exists-icon').removeClass('hidden');
    });
}

function numSuffix(num){
    let numMod100 = num%100;
    switch(num%10){
        case 1:
            return num + (numMod100===11 ? 'th' : 'st');
            break;
        case 2:
            return num + (numMod100===12 ? 'th' : 'nd');
            break;
        case 3:
            return num + (numMod100===13 ? 'th' : 'rd');
            break;
        default: return num + 'th'
    }
}

function trueMod(n, m) {
    return ((n % m) + m) % m;
}

function help(){
    var win = window.open('https://image.ibb.co/idENnq/help.png', '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Please allow popups for this website');
    }
}