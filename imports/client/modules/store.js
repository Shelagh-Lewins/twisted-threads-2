import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './rootReducer';
import DevTools from '../components/DevTools';

const logger = createLogger();

const middleware = [thunk];

// redux-logger to record all Redux actions
if (process.env.NODE_ENV === 'development') {
	middleware.push(logger);
}

const enhancers = [
	applyMiddleware(...middleware),
];

// in development only, add DevTools as React components
if (process.env.NODE_ENV === 'development') {
	enhancers.push(DevTools.instrument());
}

const store = createStore(rootReducer, {}, compose(...enhancers));

export default store;
