import { composite } from 'pathify';
const defaults = {
  player: null,
  user: null,
}
export default function reducer(state={
    status:{
      fetching: false,
      fetched: false,
      error: null
    }
  }, action){
    switch (action.type){
      case 'FETCH_IDENTITY_PENDING':
        return composite({ ...state, 'status.fetching':true })
      case 'FETCH_IDENTITY_FULFILLED':
        return composite({ ...state, 'status.fetching':false, 'status.fetched':true, 'status.error':null, ...action.payload.data })
      case 'FETCH_IDENTITY_REJECTED':
        return composite({ ...state, 'status.fetching':false, 'status.error':action.payload })
      default:
        // console.error(`Action type: ${action.type} is not supported.\nAction: ${action}`);// throw Error(`Action type: ${action.type} is not supported.\nAction: ${action}`);
        return state;
    }
}