// Set up the store by combining the partial reducers

import { combineReducers } from 'redux';
import auth from './auth';
import colorBook from './colorBook';
import errors from './errors';
import pattern from './pattern';
import patternImages from './patternImages';
import search from './search';

// by importing the actual reducer as the default, the state of each is initialised

export default combineReducers({
	auth,
	colorBook,
	errors,
	pattern,
	patternImages,
	search,
});
