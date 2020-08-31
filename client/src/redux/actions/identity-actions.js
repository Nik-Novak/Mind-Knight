import axios from 'axios'

export function fetchIdentity(){
  return {
    type: "FETCH_IDENTITY",
    payload: axios.get('/data/identity', {baseURL:window.location.origin})
  }
}