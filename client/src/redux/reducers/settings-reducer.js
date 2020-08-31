import { composite } from 'pathify';
const defaults = {
  tooltips: true,
  game:{
    advanced_stats:true,
    turn_scroll_lock:false,
    display_usernames:true,
    scroll_to_chat: true
  }
}
export default function reducer(state={
  ...defaults,
  status:{
    saving: false,
    saved: false,
    fetching: false,
    fetched: false,
    error: null
  }
}, action){
  switch (action.type){
    case 'FETCH_SETTINGS_PENDING':
      return composite({ ...state, 'status.fetching': true });
    case 'FETCH_SETTINGS_FULFILLED':
      return composite({ ...state, 'status.fetching':false, 'status.fetched':true, 'status.error':null, ...action.payload })
    case 'FETCH_SETTINGS_REJECTED':
      return composite({ ...state, 'status.fetching':false, 'status.error':action.payload })

    case 'SAVE_SETTINGS':
      return composite({ ...state, 'status.saving': true })
    case 'SAVE_SETTINGS_FULFILLED':
      return composite({ ...state, 'status.saving':false, 'status.saved':true, 'status.error':null })
    case 'SAVE_SETTINGS_REJECTED':
      return composite({ ...state, 'status.saving':false, 'status.error':action.payload })

    case 'SET_SETTINGS_TOOLTIPS':
      return composite({ ...state, 'tooltips': action.payload })
    case 'SET_SETTINGS_ADVANCED_STATS':
      return composite({ ...state, 'game.advanced_stats': action.payload })
    case 'SET_SETTINGS_TURN_SCROLL_LOCK':
      return composite({ ...state, 'game.turn_scroll_lock': action.payload })
    case 'SET_SETTINGS_DISPLAY_USERNAMES':
      return composite({ ...state, 'game.display_usernames': action.payload })
    case 'SET_SETTINGS_SCROLL_TO_CHAT':
      return composite({ ...state, 'game.scroll_to_chat': action.payload })
    default:
      return state;
  }
}