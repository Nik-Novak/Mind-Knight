//@ts-check
import { combineReducers } from 'redux'

import versionReducer from './version-reducer'
import stateServerReducer from './state-server-reducer'
import stateAppGameReducer from './state-app-game-reducer'
import gameReducer from './game-reducer'
import identityReducer from './identity-reducer'
import settingsReducer from './settings-reducer'

export default combineReducers({
  version: versionReducer,
  identity: identityReducer,
  state: combineReducers({
    server: stateServerReducer,
    app: combineReducers({
      game: stateAppGameReducer
    })
  }),
  game: gameReducer,
  settings: settingsReducer
})