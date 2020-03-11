// convert text loaded from file into a pattern object that can be created in the database

// map from friendly field names in TWT2 file format
// to pattern field names in database

import {
	DEFAULT_PALETTE,
	PATTERN_AS_TEXT_FIELDS,
} from '../../modules/parameters';

const convert = require('xml-js');


// Try analysing as a TWT pattern
// this definition form is required to make it a function that can be called by variable name as a method of the Meteor object
Meteor.newPatternFromJSON = function newPatternFromJSON({ text }) { // eslint-disable-line no-undef
	let isValid = false;
	let patternObj = {};

	if (typeof text === 'string' && text !== '') {
		try {
			patternObj = JSON.parse(text);
			isValid = true;

			const {
				source,
				version,
			} = patternObj;

			if (source === 'Twisted Threads' && version === '2.0') {
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

// this definition form is required to make it a function that can be called by variable name as a method of the Meteor object
Meteor.newPatternFromGTT = function newPatternFromGTT({ filename, text }) { // eslint-disable-line no-undef
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
			// Version,
		} = TWData;

		// console.log('Version', Version._text);
		//console.log('Pattern', Pattern);

		if (Source._text !== 'Guntram\'s Tabletweaving Thingy') {
			isValid = false;
		} else {
			const {
				Cards,
				Data, // broken twill only
				Name,
				Notes,
				Packs,
				Palette, // GTT 1.11 does not include Palette data
				Picks,
				Reversals, // GTT 1.11, broken twill only
			} = Pattern;

			let Pack; // array of pack data for threaded patterns using packs
			let Pick; // array of pick data for threaded patterns
			const LongFloats = Pattern.LongFloats || {}; // broken twill only, later versions

			// build threading
			const { Card } = Cards; // array of card data
			const holes = parseInt(Card[0]._attributes.Holes, 10); // assume all tablets have the same number of holes
			const numberOfTablets = Card.length;

			let description = 'A pattern imported from Guntram\'s Tablet Weaving Thingy';
			let name = filename;
			let numberOfRows;
			const orientations = [];
			const palette = DEFAULT_PALETTE;
			const patternDesign = {};
			let patternType;
			const threading = [];
			const weavingInstructions = []; // for individual patterns
			const twillPatternChart = []; // for broken twill
			const twillDirectionChangeChart = []; // for broken twill

			// name
			if (Name._cdata) {
				name = Name._cdata;
			}

			// description
			if (Notes) {
				const NotesKeys = Object.keys(Notes);

				if (NotesKeys.length > 0) {
					description = '';

					NotesKeys.forEach((NoteKey) => {
						const line = Notes[NoteKey]._cdata;
						if (line) {
							description += ` ${Notes[NoteKey]._cdata}`;
						} else {
							description += '\n\n';
						}
					});
				}
			}

			// build the color palette

			// GTT 1.11 does not include Palette data
			const GTTPalette = Palette ? Palette.Colour.map((colourDef) => colourDef._text)
				: [
					0,
					128,
					32768,
					32896,
					8388608,
					8388736,
					8421376,
					8421504,
					12632256,
					255,
					65280,
					65535,
					16711680,
					16711935,
					16776960,
					16777215,
				];
			for (let i = 0; i < DEFAULT_PALETTE.length; i += 1) {
				palette[i] = convertWindowsColorToHexRGB(GTTPalette[i]);
			}

			for (let i = 0; i < holes; i += 1) {
				threading[i] = [];

				for (let j = 0; j < numberOfTablets; j += 1) {
					threading[i][j] = parseInt(Card[j].Holes.Colour[i]._text, 10);

					if (i === 0) { // only need to do this once per tablet
						orientations[j] = (Card[j].Threading._text === 'S') ? '/' : '\\';
					}
				}
			}
//console.log('type', Pattern._attributes.Type);
			// pattern design
			switch (Pattern._attributes.Type) {
				case 'Threaded': // GTT v1.05
				case 'Threaded-in': // GTT v1.17
					patternType = 'individual';
					({ Pack } = Packs);
					({ Pick } = Picks);
					numberOfRows = Pick.length;

					// has this pattern been woven with packs?
					// e.g. 4 hole leaves
					const packsObj = {}; // eslint-disable-line no-case-declarations

					if (Pack) {
						// TWT2 doesn't use packs
						// so convert to individual turning
						// extract the pack definitions
						for (let i = 0; i < Pack.length; i += 1) {
							let cardsList = [];

							if (Pack[i].Cards._text) {
								cardsList = Pack[i].Cards._text.split(',');
							}

							packsObj[Pack[i]._attributes.Name] = cardsList;
						}
					}

					// packs may be defined but Picks defined by Card turns
					// if only one pack is turned in a Pick then it appears as a simple object not an array
					// e.g Anglo-Saxon
					// if multiple packs are turned Actions.Action is loaded as an array
					// The GTT format is consistent but the JSON conversion from XML is not
					const testPick = Pick[0].Actions.Action; // eslint-disable-line no-case-declarations
					let usePacks = false; // eslint-disable-line no-case-declarations

					if (testPick[0]) {
						usePacks = Pick[0].Actions.Action[0]._attributes.Target === 'Pack';
					} else {
						usePacks = Pick[0].Actions.Action._attributes.Target === 'Pack';
					}

					if (usePacks) {
						// turn the packs
						for (let i = 0; i < numberOfRows; i += 1) {
							weavingInstructions[i] = [];

							// idle packs are not mentioned
							// so set all tablets to idle by default
							for (let j = 0; j < numberOfTablets; j += 1) {
								const weavingInstruction = {
									'direction': 'F',
									'numberOfTurns': 0,
								};

								weavingInstructions[i][j] = weavingInstruction;
							}

							// turn tablets in each pack for this row
							let actions; // eslint-disable-line no-case-declarations

							// multiple Packs turned in pick so Action is an array
							if (Pick[i].Actions.Action[0]) {
								actions = Pick[i].Actions.Action;
							} else {
								actions = [Pick[i].Actions.Action];
							}

							for (let j = 0; j < actions.length; j += 1) {
								const thisPick = actions[j]._attributes;

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
					} else {
						for (let i = 0; i < numberOfRows; i += 1) {
							weavingInstructions[i] = new Array(numberOfTablets);

							for (let j = 0; j < numberOfTablets; j += 1) {
								// tablets are not necessarily in order
								// TargetID gives table number
								const thisPick = Pick[i].Actions.Action[j]._attributes;
								const tabletIndex = parseInt(thisPick.TargetID, 10) - 1;

								weavingInstructions[i][tabletIndex] = {
									'direction': thisPick.Dir,
									'numberOfTurns': parseInt(thisPick.Dist, 10),
								};
							}
						}
					}

					patternDesign.weavingInstructions = weavingInstructions;
					break;

				case 'BrokenTwill':
					patternType = 'brokenTwill';
					const chartLength = Object.keys(Data).length; // eslint-disable-line no-case-declarations
					numberOfRows = chartLength * 2;

					if (Reversals) { // GTT 1.11
						// "Reversals" are the old form of LongFloats
						// in reverse order
						for (let i = 0; i < chartLength; i += 1) {
							const identifier = `P${i + 1}`;
							const reverseIdentifier = `P${chartLength - i}`;

							LongFloats[identifier] = Reversals[reverseIdentifier];
						}
					}

					// copy the chart data
					for (let i = 0; i < chartLength; i += 1) {
						twillPatternChart[i] = [];
						twillDirectionChangeChart[i] = [];

						const identifier = `P${i + 1}`;
						twillPatternChart[i] = Array.from(Data[identifier]._text);
						twillDirectionChangeChart[i] = Array.from(LongFloats[identifier]._text);
					}

					// add an extra blank row at the end of each chart
					// this extra row is not shown in preview or weaving chart but is used to determine the last even row
					twillPatternChart.push(new Array(numberOfTablets).fill('.'));
					twillDirectionChangeChart.push(new Array(numberOfTablets).fill('.'));

					// GTT 1.11 does not store twill direction
					patternDesign.twillDirection = Pattern.BackgroundTwill ? Pattern.BackgroundTwill._text : 'S';
					patternDesign.weavingStartRow = 1;
					patternDesign.twillPatternChart = twillPatternChart;
					patternDesign.twillDirectionChangeChart = twillDirectionChangeChart;
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
			patternObj.weftColor = 15; // white
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

	// the only sure test for whether the text is JSON or XML is to parse it
	// however it is wasteful to try to parse it as JSON and on fail, try again as XML
	// so use the file extension to make a guess which to try first

	// find file extension
	const filenameArray = filename.split('.');
	const fileExtension = filenameArray.pop();

	let firstFormat = 'newPatternFromJSON';
	let secondFormat = 'newPatternFromGTT';
	if (fileExtension === 'gtt') {
		firstFormat = 'newPatternFromGTT';
		secondFormat = 'newPatternFromJSON';
	}

	({ isValid, patternObj } = Meteor[firstFormat]({ filename, text }));

	if (!isValid) {
		({ isValid, patternObj } = Meteor[secondFormat]({ filename, text }));
	}

	return { isValid, patternObj };
};

export default newPatternFromFile;
