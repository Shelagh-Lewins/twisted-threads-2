// validate a number from an HTML spinner

const validateInteger = ({
	max,
	min,
	odd,
	even,
	required,
	value,
}) => {
	let error;
	const valueAsNumber = parseFloat(value);

	if (required) {
		if (!valueAsNumber && valueAsNumber !== 0) { // 0 is falsy but we don't want to report it as missing
			error = 'Required';
		}
	}

	if (!Number.isNaN(valueAsNumber)) {
		if (valueAsNumber < min) {
			error = `Must be at least ${min}`;
		} else if (!Number.isInteger(valueAsNumber)) {
			error = 'Must be a whole number';
		} else if (odd && valueAsNumber % 2 !== 1) {
			error = 'Must be an odd number';
		} else if (even && valueAsNumber % 2 !== 0) {
			error = 'Must be an even number';
		} else if (valueAsNumber > max) {
			error = `Cannot be greater than ${max}`;
		}
	}

	return error;
};

export default validateInteger;
