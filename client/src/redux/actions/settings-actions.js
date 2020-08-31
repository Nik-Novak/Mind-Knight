import axios from 'axios'

export function fetchSettings(){
  return {
    type: "FETCH_SETTINGS",
    payload: axios.get('/data/settings', {baseURL:window.location.origin})
  }
}

export function setTooltips(value){
  return {
    type: "SET_SETTINGS_TOOLTIPS",
    payload: value
  }
}

export function setAdvancedStats(value){
  return {
    type: "SET_SETTINGS_ADVANCED_STATS",
    payload: value
  }
}

export function setAdvancedTurnScrollLock(value){
  return {
    type: "SET_SETTINGS_TURN_SCROLL_LOCK",
    payload: value
  }
}

export function setDisplayUsernames(value){
  return {
    type: "SET_SETTINGS_DISPLAY_USERNAMES",
    payload: value
  }
}

export function setScrollToChat(value){
  return {
    type: "SET_SETTINGS_SCROLL_TO_CHAT",
    payload: value
  }
}

export function saveSettings(settings){
  return {
    type: "SAVE_SETTINGS",
    payload: axios.post('/data/settings', settings, {baseURL:window.location.origin})
  }
}