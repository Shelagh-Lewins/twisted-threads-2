// join arrays of error messages from different errors, into a single string.
// it is expected that there will only ever be one type of error, e.g. 'register', but the object is parsed to be on the safe side.
/*
{ {'register': [
		'email already in use',
		'username already in use'
		]},
	{'login': [
		'could not log in'
	]
}
*/

// combine error type and message to give more information
const buildString = (key, error) => `${key}: ${error}`;

export default function (errors) {
	const messageArray = [];
	Object.keys(errors).forEach((key) => {
		const error = errors[key];

		if (typeof error === 'string') {
			messageArray.push(buildString(key, error)); // plain string error
		} else { // array of errors
			error.map((item) => { // eslint-disable-line array-callback-return
				messageArray.push(buildString(key, item));
			});
		}
	});

	const message = messageArray.join(' ');

	return message;
}
