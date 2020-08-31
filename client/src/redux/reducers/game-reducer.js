//@ts-check
import { composite } from 'pathify';

const defaults = {

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
    case 'FETCH_GAME_PENDING':
      return composite({ ...state, 'status.fetching':true })
    case 'FETCH_GAME_FULFILLED':
      return composite({ ...state, 'status.fetching':false, 'status.fetched':true, 'status.error':null, ...action.payload.data })
    case 'FETCH_GAME_REJECTED':
      return composite({ ...state, 'status.fetching':false, 'status.error':action.payload })
    case 'UPDATE_GAME':
      return composite({ ...state, ...action.payload })
    default:
      return state;
  }
}