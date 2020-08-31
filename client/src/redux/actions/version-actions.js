import axios from 'axios'

export function fetchVersion(){
  return {
    type: "FETCH_VERSION",
    payload: axios.get('/version', {baseURL:window.location.origin})
  }
}