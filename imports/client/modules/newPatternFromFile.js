// convert text loaded from file into a pattern object that can be created in the database

// map from friendly field names in TWT2 file format
// to pattern field names in database

import {
	DEFAULT_PALETTE,
	DEFAULT_WEFT_COLOR,
	PATTERN_AS_TEXT_FIELDS,
} from '../../modules/parameters';

const convert = require('xml-js');


// Try analysing as a TWT pattern
const newPatternFromJSON = ({ text }) => {
	let isValid = false;
	let patternObj = {};

	if (typeof text === 'string' && text !== '') {
		try {
			patternObj = JSON.parse(text);
			isValid = true;

			const {
				fileType,
				version,
			} = patternObj;

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
					const fieldValue = patternObj[displayName];

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
		} catch (error) {
			console.log('error parsing JSON', error);
		}
	}

	return { isValid, patternObj };
};

// GTT stores colours as a decimal BGR e.g. 8421440, 128
const convertWindowsColorToHexRGB = (windowsColor) => {
	const integerColor = parseInt(windowsColor, 10);
	let hexColor = (`000000${integerColor.toString(16)}`).slice(-6); // pad from the start up to 6 digits
	hexColor = hexColor.substring(4, 6) + hexColor.substring(2, 4) + hexColor.substring(0, 2); // swap blue and red components

	return `#${hexColor}`;
};

const newPatternFromGTT = ({ filename, text }) => {
	// data is an object
	// created by parsing XML from a GTT file
	let isValid = true;
	const patternObj = {};

	if (!text || text === '') {
		return false;
	}

	if (typeof text !== 'string') {
		return false;
	}

	let data;

	try {
		const JSONstring = convert.xml2json(text, {
			'compact': true,
			'spaces': 4,
		});
		data = JSON.parse(JSONstring);
		isValid = true;

		const { TWData } = data;
		const {
			Pattern,
			Source,
			Version,
		} = TWData;

		console.log('Version', Version._text);
		console.log('Pattern', Pattern);

		if (Source._text !== 'Guntram\'s Tabletweaving Thingy') {
			isValid = false;
		} else {
			const {
				Cards,
				Name,
				Notes,
				Packs,
				Picks,
				Palette,
			} = Pattern;

			const { Pack } = Packs; // array of packs, may or may not exist
			const { Pick } = Picks; // array of pick data for threaded, threaded-in patterns

			let description = 'A pattern imported from Guntram\'s Tablet Weaving Thingy';
			let holes;
			let name = filename;
			let numberOfRows;
			let numberOfTablets;
			const orientations = [];
			const palette = DEFAULT_PALETTE;
			const patternDesign = {};
			let patternType;
			const threading = [];

			const weavingInstructions = []; // for individual patterns

			// name
			if (Name._cdata) {
				name = Name._cdata;
			}

			// description
			const NotesKeys = Object.keys(Notes);

			if (NotesKeys.length > 0) {
				description = '';

				NotesKeys.forEach((NoteKey) => {
					description += Notes[NoteKey]._cdata;
				});
			}

			// build the color palette
			for (let i = 0; i < DEFAULT_PALETTE.length; i += 1) {
				const GTTColour = Palette.Colour[i];
				if (GTTColour) {
					palette[i] = convertWindowsColorToHexRGB(GTTColour._text);
				}
			}

			// build threading
			const { Card } = Cards; // array of card data
			holes = parseInt(Card[0]._attributes.Holes, 10); // assume all tablets have the same number of holes
			numberOfTablets = Card.length;

			for (let i = 0; i < holes; i += 1) {
				threading[i] = [];

				for (let j = 0; j < numberOfTablets; j += 1) {
					threading[i][j] = parseInt(Card[j].Holes.Colour[i]._text, 10); // TODO tablet labels are probably the wrong way round, check.

					if (i === 0) { // only need to do this once per tablet
						orientations[j] = (Card[j].Threading === 'S') ? '/' : '\\';
					}
				}
			}

			// pattern design
			switch (Pattern._attributes.Type) {
				case 'Threaded': // GTT v1.05
				case 'Threaded-in': // GTT v1.17
					patternType = 'individual';
					numberOfRows = Pick.length;

					// has this pattern been woven with packs?
					// e.g. 4 hole leaves
					if (Pack) {
						// TWT2 doesn't use packs
						// so convert to individual turning
						const packsObj = {};

						// extract the pack definitions
						for (let i = 0; i < Pack.length; i += 1) {
							let cardsList = [];

							if (Pack[i].Cards._text) {
								cardsList = Pack[i].Cards._text.split(',');
							}

							packsObj[Pack[i]._attributes.Name] = cardsList;
						}

						// turn the packs
						for (let i = 0; i < numberOfRows; i += 1) {
							weavingInstructions[i] = [];

							// turn tablets in each pack for this row
							for (let j = 0; j < Pack.length; j += 1) {
								const thisPick = Pick[i].Actions.Action[j]._attributes;

								const targetPack = packsObj[thisPick.TargetID]; // array of tablet numbers, starting at 1

								const weavingInstruction = {
									'direction': thisPick.Dir,
									'numberOfTurns': parseInt(thisPick.Dist, 10),
								};

								targetPack.forEach((tabletNumber) => {
									weavingInstructions[i][tabletNumber - 1] = weavingInstruction;
								});
							}
						}
					} else { // e.g. simple
						for (let i = 0; i < numberOfRows; i += 1) {
							weavingInstructions[i] = [];

							for (let j = 0; j < numberOfTablets; j += 1) {
								const thisPick = Pick[i].Actions.Action[j]._attributes;

								weavingInstructions[i][j] = {
									'direction': thisPick.Dir,
									'numberOfTurns': parseInt(thisPick.Dist, 10),
								};
							}
						}
					}

					patternDesign.weavingInstructions = weavingInstructions;
					break;

				case 'BrokenTwill':
					break;

				default:
					isValid = false;
					break;
			}

			patternObj.name = name;
			patternObj.description = description;
			patternObj.holes = holes;
			patternObj.numberOfRows = numberOfRows;
			patternObj.numberOfTablets = numberOfTablets;
			patternObj.orientations = orientations;
			patternObj.palette = palette;
			patternObj.patternDesign = patternDesign;
			patternObj.patternType = patternType;
			patternObj.threading = threading;
			patternObj.weftColor = DEFAULT_WEFT_COLOR;
		}
	} catch (error) {
		console.log('error', error);
		return false;
	}

	return { isValid, patternObj };
};

const newPatternFromFile = ({ filename, text }) => {
	let patternObj;
	let isValid;

	({ isValid, patternObj } = newPatternFromJSON({ text }));

	if (!isValid) {
		({ isValid, patternObj } = newPatternFromGTT({ filename, text }));
		isValid = false;
	}

	return { isValid, patternObj };
};

export default newPatternFromFile;
