//@ts-check
import { applyMiddleware, createStore } from "redux"

// Middleware
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import promise from 'redux-promise-middleware'
import asyncDispatch from 'redux-async-dispatch';

import reducer from './reducers'

const middleware = applyMiddleware( promise, thunk, asyncDispatch, logger );

export default createStore(reducer, middleware);