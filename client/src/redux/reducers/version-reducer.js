import { composite } from 'pathify';

const defaults = {
  local: null,
  remote:null,
}
export default function reducer(state={
    ...defaults,
    status:{
      fetching: false,
      fetched:false,
      error:null
    }
  }, action){
    switch(action.type){
      case 'FETCH_VERSION_PENDING':
        return composite({ ...state, 'status.fetching':true })
      case 'FETCH_VERSION_FULFILLED':
        return composite({ ...state, 'status.fetching':false, 'status.fetched':true, 'status.error':null, ...action.payload.data })
      case 'FETCH_VERSION_REJECTED':
        return composite({ ...state, 'status.fetching':false, 'status.error':action.payload })
      default:
        return state
    }
}
