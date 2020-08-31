//@ts-check
import { composite } from 'pathify'
const defaults = {
  lastEvent: null,
  gameInProgress: false,
}

export default function reducer(state={
  ...defaults,
  status:{
    fetching: false,
    fetched: false,
    error: null
  }
}, action){
  switch (action.type){
    case 'FETCH_STATE_PENDING':
      return composite({ ...state, 'status.fetching':true });
    case 'FETCH_STATE_FULFILLED':
      return composite({ ...state, 'status.fetching':false, 'status.fetched':true, 'status.error':null, ...action.payload.data })
    case 'FETCH_STATE_REJECTED':
      return composite({ ...state, 'status.fetching':false, 'status.error':action.payload })
    case 'UPDATE_STATE_SERVER':
      return composite({ ...state, ...action.payload })
    default:
      // console.error(`Action type: ${action.type} is not supported.\nAction: ${action}`);// throw Error(`Action type: ${action.type} is not supported.\nAction: ${action}`);
      return state;
  }
}