// convert a TWT2 pattern to text suitable for saving locally in a file

import {
	PATTERN_AS_TEXT_FIELDS,
} from '../../modules/parameters';

const beautify = require('js-beautify').js;

const getDisplayName = (fieldName) => PATTERN_AS_TEXT_FIELDS.find((field) => fieldName === field.fieldName).displayName;

const patternAsText = (_id, patternObj) => {
	const {
		description,
		holes,
		includeInTwist,
		name,
		numberOfRows,
		numberOfTablets,
		orientations,
		palette,
		patternDesign,
		patternType,
		tags,
		threading,
		threadingNotes,
		weavingNotes,
		weftColor,
	} = patternObj;

	// source is just info to indicate where the file was generated
	const patternData = {
		'source': 'Twisted Threads',
		'version': '2.1', // 2.1 introduced includeInTwist
		[getDisplayName('name')]: name,
		[getDisplayName('description')]: description,
	};

	if (includeInTwist) {
		patternData[getDisplayName('includeInTwist')] = includeInTwist;
	}

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
	patternData[getDisplayName('palette')] = palette;
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
