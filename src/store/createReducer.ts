import { combineReducers, Reducer } from 'redux';
import { createBrowserHistory, History } from 'history';
import { connectRouter } from 'connected-react-router';
import { reducer as kratosAuth } from 'KratosAuth';
import { reducer as config } from 'Config';
import AppReducer from '../App/reducer';

export default function getCreateReducer(history: History = createBrowserHistory()) {
  return function createReducer(): Reducer {
    return combineReducers({
      router: connectRouter(history),
      subApp: AppReducer,
      kratosAuth,
      config,
    });
  };
}
