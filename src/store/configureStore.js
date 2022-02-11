import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from '../reducers';

const routeMiddleware = routerMiddleware();

let createStoreWithMiddleware;
if (process.env.NODE_ENV !== 'production') {
  createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    routeMiddleware,
    logger
  )(createStore);
} else {
  createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    routeMiddleware
  )(createStore);
}

function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}

const store = configureStore();

export default store;
