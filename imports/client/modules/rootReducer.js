// Set up the store by combining the partial reducers

import { combineReducers } from 'redux';
import auth from './auth';
import errors from './errors';
import pattern from './pattern';
import colorBook from './colorBook';

// by importing the actual reducer as the default, the state of each is initialised

export default combineReducers({
	auth,
	errors,
	pattern,
	colorBook,
});
