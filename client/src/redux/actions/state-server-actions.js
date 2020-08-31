import axios from 'axios'

export function fetchState(){
  return {
    type: "FETCH_STATE",
    payload: axios.get('/state', {baseURL:window.location.origin})
  }
}
export function updateStateServer(state){
  return {
    type: "UPDATE_STATE_SERVER",
    payload: state
  }
}