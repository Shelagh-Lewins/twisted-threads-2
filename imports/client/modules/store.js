import { applyMiddleware, createStore, compose } from 'redux';
import * as thunkModule from 'redux-thunk';
import rootReducer from './rootReducer';

// Support both ESM named export and CommonJS default
const thunk = thunkModule.thunk || thunkModule.default || thunkModule;
const middleware = [thunk];

// compose with Redux Devtools extension in development only
const composeEnhancers =
  (process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));

const store = createStore(rootReducer, enhancer);

export default store;
