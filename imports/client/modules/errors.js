// errorReducer.js
const updeep = require('updeep');

const GET_ERRORS = 'GET_ERRORS';
const CLEAR_ERRORS = 'CLEAR_ERRORS';

// error is an object, e.g. { 'registration': error.message }
export const getErrors = (error) =>
	({
		'type': GET_ERRORS,
		'payload': error,
	});

export const clearErrors = () => {
	return {
		'type': CLEAR_ERRORS,
	};
};

const initialState = {};

export default function (state = initialState, action) {
	switch (action.type) {
		case GET_ERRORS: {
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

			return updeep(errors, {}); // clear any existing errors
		}

		case CLEAR_ERRORS: {
			return {};
		}

		default:
			return state;
	}
}
