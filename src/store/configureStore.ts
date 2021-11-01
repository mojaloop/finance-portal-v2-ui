import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import createSagaMiddleware from 'redux-saga';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import getCreateReducer from './createReducer';
import rootSaga from './sagas';

interface StoreConfig {
  isDevelopment: boolean;
  history: History;
}

export default function configure(config: StoreConfig, preloadedState = {}) {
  const { history } = config;
  const sagaMiddleware = createSagaMiddleware({});
  const createReducer = getCreateReducer(history);
  const staticReducers = createReducer();
  const middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware, ...getDefaultMiddleware());
  const composeEnhancers = composeWithDevTools({});
  const store = createStore(
    staticReducers,
    preloadedState,
    // @ts-ignore
    composeEnhancers(middleware),
  );

  sagaMiddleware.run(rootSaga);

  return store;
}
