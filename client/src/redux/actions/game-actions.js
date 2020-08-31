import axios from 'axios'

export function fetchGame(){
  return {
    type: "FETCH_GAME",
    payload: axios.get('/game', {baseURL:window.location.origin})
  }
}

export function updateGame(game){
  return {
    type: "UPDATE_GAME",
    payload: game
  }
}