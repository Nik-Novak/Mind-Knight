

//@ts-check
console.log('INIT client.js');

$('#content .card .card-action a').click((e)=>{
  e.preventDefault();
  return false;
});

var tournies;
var identity;

(async ()=>{

const database = new Database(window.location.origin);

let tournies = await database.getTournaments();

identity = await database.getIdentity();

console.log('IDENTITY:', identity);
console.log('Tournaments:', tournies);

(await database.getGameByID('5ebce6b4675bb139ccebd8c3')).printResults();

$( document).ready(function(){
  for(let i=0; i< tournies.length; i++){
    console.log(tournies[i].data)
    let eligible = onRoster(identity, tournies[i].data.roster);
    let backup;
    if(!eligible)
      backup = onRoster(identity, tournies[i].data.roster);
    let template = 
    `<div class="card sticky-action" index='${i}'>
       <div class="card-image waves-effect waves-block waves-light">
         <img class="activator" src="img/mindnight-invitational.png">
       </div>
       <div class="card-content">
         <span class="card-title activator grey-text text-darken-4">${tournies[i].data.name}<i class="material-icons right">more_vert</i></span>
         <p class='secondary'><a class='announcement' target="_blank" href="https://steamcommunity.com/groups/Mindnight_CV_2020_Invitational">Announcement</a><span id='next-game-countdown'></span></p>
       </div>
       <div class="card-action"><a class="disabled">Join</a><a ${eligible?"onclick='play("+i+")'":"class=disabled"}>Play</a><a>More</a></div>
       <div class="card-reveal">
         <span class="card-title grey-text text-darken-4">${tournies[i].data.name}<i class="material-icons right">close</i></span>
         <p>Here is some more information about this tourny that is only revealed once clicked on. TODO</p>
       </div>
     </div>`;
     $('#content .options-container').append(template);

     if(!identity)
      continue;

    let tournament = tournies[i];
    let nextGamesArr = nextGames(identity.localPlayer, tournament);
    console.log(nextGamesArr);
    if(!nextGamesArr || nextGamesArr.length == 0){
      console.log('No games found');
      continue;
    }
    console.log("MY NEXT GAME IS:", nextGamesArr[0]);
    let nextGameDate = new Date(nextGamesArr[0].scheduled);
    let nextGameDateEastern = UTCtoEastern(new Date(nextGameDate));

    tournies[i].data.nextGame = nextGamesArr[0];
    
    setInterval(function(){
      let deltaT = (nextGameDate.getTime() - new Date().getTime())/1000;

      // calculate (and subtract) whole days
      var days = Math.floor(deltaT / 86400);
      deltaT -= days * 86400;

      // calculate (and subtract) whole hours
      var hours = Math.floor(deltaT / 3600) % 24;
      deltaT -= hours * 3600;

      // calculate (and subtract) whole minutes
      var minutes = Math.floor(deltaT / 60) % 60;
      deltaT -= minutes * 60;
      
      tournies[i].data.deltaD = days;
      deltaT -= tournies[i].data.deltaD * 86400;
      tournies[i].data.deltaH = hours;
      tournies[i].data.deltaM = minutes
      if(tournies[i].data.deltaD<=0 && tournies[i].data.deltaH<=0 && tournies[i].data.deltaM<=0){
        clearInterval(this);
        $(`.card[index="${i}"] .card-content #next-game-countdown`).html('');
      }
      $(`.card[index="${i}"] .card-content #next-game-countdown`).html(`${tournies[i].data.deltaD}d ${tournies[i].data.deltaH}h ${tournies[i].data.deltaM}m until your next game`);
    },3000);
    console.log('Eastern time of next game:', nextGameDate);
  };
});

function onRoster(identity, roster){
  for(let participant of roster){
    if(identity && participant.playerID == identity.localPlayer._id){
      return true;
    }
  };
  return false;
}

function UTCtoEastern(date){
  let offset = date.getTimezoneOffset()*60000;
  let tmp = date.getTime()+offset;
  const EAST = 3600000*-4 //-4 cuz eastern is 4 hours behind. 3600000 comes from hours to milliseconds
  return new Date(tmp + EAST);
}

function nextDays(tournament){
  let futureDates = [];
  tournament.data.days.filter(day=>{ //discard past days
    let tournyDate = new Date(day.date);
    tournyDate.setHours(0,0,0,0);
    let today = new Date();
    today.setHours(0,0,0,0);
    return ( tournyDate.getTime() - today.getTime())>=0
  }) .forEach(futureDay=>futureDates.push(futureDay.date));
  return futureDates.sort();
}

function nextGames(localPlayer, tournament){
  let futureGames = [];
  let localRosterIndex = tournament.data.roster.reduce((result, value, key)=>value.playerID==localPlayer._id?key:result);
  console.log(localRosterIndex);
  let days = nextDays(tournament);
  days.forEach(day=>{
    let fullDay = tournament.data.days.find(d=>d.date==day);
    fullDay.heats.forEach(heat=>{
      if(heat.games.find(game=>game.player_roster_indexes.includes(localRosterIndex))){
        let gamesWMe = [];
        heat.games.forEach(game=>gamesWMe.push(game));
        futureGames.push(...gamesWMe.sort());
      }
    })
  })
  return futureGames;
}

})();

function play(tournamentIndex){
  let tournament = tournies[tournamentIndex];
  if(tournament.data.deltaD > 0 || tournament.data.deltaH>0 ) { //if we're anything more than 1 hr away
    M.Toast.dismissAll();
    M.toast({html: "It's too early to start the game!"})
    M.toast({html: 'Wait until atleast an hour away'})
  }
}