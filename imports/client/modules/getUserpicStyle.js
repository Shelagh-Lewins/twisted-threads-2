const getUserpicStyle = (_id) => {
	// quick way to give users different coloured backgrounds
	const num = _id.charCodeAt(0);

	switch (true) {
		case (num < 55):
			return 'userpic-1';

		case (num < 75):
			return 'userpic-2';

		case (num < 90):
			return 'userpic-3';

		case (num < 105):
			return 'userpic-4';

		default:
			return 'userpic-5';
	}
};

export default getUserpicStyle;
