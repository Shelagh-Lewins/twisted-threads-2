// convert a TWT2 pattern to text suitable for saving locally in a file

import {
	PATTERN_AS_TEXT_FIELDS,
} from '../../modules/parameters';

const beautify = require('js-beautify').js;

const getDisplayName = (fieldName) => {
	return PATTERN_AS_TEXT_FIELDS.find((field) => fieldName === field.fieldName).displayName;
};

const patternAsText = (_id, patternObj) => {
	const {
		description,
		holes,
		name,
		numberOfRows,
		numberOfTablets,
		orientations,
		patternDesign,
		patternType,
		tags,
		threading,
		threadingNotes,
		weavingNotes,
		weftColor,
	} = patternObj;

	// header has no function, it is just to make the file more readable
	const patternData = {
		'header': 'A tablet weaving pattern designed in Twisted Threads',
		'version': '2.0',
		[getDisplayName('name')]: name,
		[getDisplayName('description')]: description,
	};

	if (tags) {
		patternData[getDisplayName('tags')] = tags;
	}

	if (threadingNotes) {
		patternData[getDisplayName('threadingNotes')] = threadingNotes;
	}

	if (weavingNotes) {
		patternData[getDisplayName('weavingNotes')] = weavingNotes;
	}

	patternData[getDisplayName('patternType')] = patternType;
	patternData[getDisplayName('holes')] = holes;
	patternData[getDisplayName('weftColor')] = weftColor;
	patternData[getDisplayName('numberOfTablets')] = numberOfTablets;
	patternData[getDisplayName('numberOfRows')] = numberOfRows;
	patternData[getDisplayName('threading')] = threading;
	patternData[getDisplayName('orientations')] = orientations;
	patternData[getDisplayName('patternDesign')] = patternDesign;

	return beautify(JSON.stringify(patternData), {
		'indent_size': 2,
		'space_in_empty_paren': true,
	});
};

export default patternAsText;
