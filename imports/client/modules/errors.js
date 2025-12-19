// errorReducer.js
import * as updeepModule from 'updeep';
const updeep = updeepModule.default || updeepModule;

const LOG_ERRORS = 'LOG_ERRORS';
const CLEAR_ERRORS = 'CLEAR_ERRORS';

// error is an object, e.g. { 'registration': error.message }
export const logErrors = (error) => ({
	'type': LOG_ERRORS,
	'payload': error,
});

export const clearErrors = () => ({
	'type': CLEAR_ERRORS,
});

const initialState = {};

export default function (state = initialState, action) {
	switch (action.type) {
		case LOG_ERRORS: {
			// ensure we have a key-value object to allow multiple errors to be displayed
			const errors = {};

			Object.keys(action.payload).forEach((key) => {
				if (typeof action.payload[key] === 'string') {
					// a string is simply copied
					errors[key] = [action.payload[key]];
				} else {
					errors[key] = [...action.payload[key]];
				}
			});

			return updeep(errors, {}); // delete any existing errors
		}

		case CLEAR_ERRORS: {
			return {};
		}

		default:
			return state;
	}
}
