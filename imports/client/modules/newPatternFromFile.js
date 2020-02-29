// convert text loaded from file into a pattern object that can be created in the database

// map from friendly field names in TWT2 file format
// to pattern field names in database

import {
	PATTERN_AS_TEXT_FIELDS,
} from '../../modules/parameters';

// Can this be a GTT pattern?
const testIsXML = (text) => {
	if (typeof text !== 'string') {
		return false;
	}
};

// Can this be a TWT pattern?
const testIsJSON = (text) => {
	if (typeof text !== 'string') {
		return false;
	}

	try {
		JSON.parse(text);
		return true;
	} catch (error) {
		return false;
	}
};

const newPatternFromJSON = (data) => {
	let isValid = true;
	const patternObj = {};

	const {
		fileType,
		version,
	} = data;

	if (fileType === 'twt' && version === '2.0') {
		// extract the expected pattern fields from data
		// text file uses displayName
		// pattern data needs fieldName
		// field may be required
		for (let i = 0; i < PATTERN_AS_TEXT_FIELDS.length; i += 1) {
			const {
				fieldName,
				displayName,
				required,
			} = PATTERN_AS_TEXT_FIELDS[i];
			const fieldValue = data[displayName];

			if (required && !fieldValue) {
				isValid = false;
				break;
			} else if (fieldValue) {
				patternObj[fieldName] = fieldValue;
			}
		}
	} else {
		isValid = false;
	}

	return { isValid, patternObj };
};

const newPatternFromFile = (text) => {
	let patternObj;
	let isValid;
	let data;

	if (testIsJSON(text)) {
		data = JSON.parse(text);
		({ isValid, patternObj } = newPatternFromJSON(data));
	}	else if (testIsXML(text)) {
		// parse xml
	} else {
		isValid = false;
	}

	return { isValid, patternObj };
};

export default newPatternFromFile;
