import { applyMiddleware, createStore, compose } from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import thunk from 'redux-thunk';

import { createLogger } from 'redux-logger';
import rootReducer from './rootReducer';
import DevTools from '../components/DevTools';

const logger = createLogger();

const enhancers = [
	applyMiddleware(thunk, logger),
];

// in development only, add DevTools as React components
if (process.env.NODE_ENV === 'development') {
	enhancers.push(DevTools.instrument());
}

const store = createStore(rootReducer, {}, compose(...enhancers));

export default store;
