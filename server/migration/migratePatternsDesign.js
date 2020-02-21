// migrate threading, palette and design charts
// move weavingInstructions and picks into patternDesign
// leave threading and palette outside
// so patternDesign holds everything that varies with pattern type
import {
	Patterns,
	Tags,
} from '../../imports/modules/collection';
import {
	ALLOWED_PATTERN_TYPES,
	DEFAULT_PALETTE,
} from '../../imports/modules/parameters';

const simStyes = JSON.parse('[{\"background_color\":\"#cc0000\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":1},{\"background_color\":\"#ffd966\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":2},{\"background_color\":\"#1c4587\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":3},{\"background_color\":\"#6aa84f\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":4},{\"background_color\":\"#674ea7\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":5,\"special\":false},{\"background_color\":\"#783f04\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":6,\"special\":false},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":7},{\"background_color\":\"#ffffff\",\"line_color\":\"#cc0000\",\"warp\":\"forward\",\"style\":8},{\"background_color\":\"#ffffff\",\"line_color\":\"#cc0000\",\"warp\":\"backward\",\"style\":9},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#cc0000\",\"warp\":\"forward\",\"style\":10,\"special\":false},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#cc0000\",\"warp\":\"backward\",\"style\":11,\"special\":false},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffd966\",\"warp\":\"forward\",\"style\":12,\"special\":false},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffd966\",\"warp\":\"backward\",\"style\":14,\"special\":false},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffd966\",\"warp\":\"forward\",\"style\":14},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffd966\",\"warp\":\"backward\",\"style\":15},{\"background_color\":\"#ffffff\",\"line_color\":\"#1c4587\",\"warp\":\"forward\",\"style\":16},{\"background_color\":\"#ffffff\",\"line_color\":\"#1c4587\",\"warp\":\"backward\",\"style\":17},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#1c4587\",\"warp\":\"forward\",\"style\":18},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#1c4587\",\"warp\":\"backward\",\"style\":19},{\"background_color\":\"#ffffff\",\"line_color\":\"#6aa84f\",\"warp\":\"forward\",\"style\":20},{\"background_color\":\"#ffffff\",\"line_color\":\"#6aa84f\",\"warp\":\"backward\",\"style\":21},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#6aa84f\",\"warp\":\"forward\",\"style\":22},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#6aa84f\",\"warp\":\"backward\",\"style\":23},{\"background_color\":\"#ffffff\",\"line_color\":\"#674ea7\",\"warp\":\"forward\",\"style\":24},{\"background_color\":\"#ffffff\",\"line_color\":\"#674ea7\",\"warp\":\"backward\",\"style\":25},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#674ea7\",\"warp\":\"forward\",\"style\":26},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#674ea7\",\"warp\":\"backward\",\"style\":27},{\"background_color\":\"#ffffff\",\"line_color\":\"#783f04\",\"warp\":\"forward\",\"style\":28},{\"background_color\":\"#ffffff\",\"line_color\":\"#783f04\",\"warp\":\"backward\",\"style\":29},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#783f04\",\"warp\":\"forward\",\"style\":30},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#783f04\",\"warp\":\"backward\",\"style\":31},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"forward\",\"style\":32},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"backward\",\"style\":33},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"forward\",\"style\":34},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"backward\",\"style\":35},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"forward_empty\",\"style\":36},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"backward_empty\",\"style\":37},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"forward_empty\",\"style\":40},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"backward_empty\",\"style\":41}]');

const simSpecialStyles = JSON.parse('[{\"background_color\":\"#FFFFFF\",\"name\":\"forward_2\",\"warp\":\"forward\",\"image\":\"/images/special_forward_2.svg\",\"style\":\"S1\"},{\"background_color\":\"#FFFFFF\",\"name\":\"backward_2\",\"warp\":\"backward\",\"image\":\"/images/special_backward_2.svg\",\"style\":\"S2\"},{\"background_color\":\"#FFFFFF\",\"name\":\"forward_3\",\"warp\":\"forward\",\"image\":\"/images/special_forward_3.svg\",\"style\":\"S3\"},{\"background_color\":\"#FFFFFF\",\"name\":\"backward_3\",\"warp\":\"backward\",\"image\":\"/images/special_backward_3.svg\",\"style\":\"S4\"},{\"background_color\":\"#FFFFFF\",\"name\":\"forward_4\",\"warp\":\"forward\",\"image\":\"/images/special_forward_4.svg\",\"style\":\"S5\"},{\"background_color\":\"#FFFFFF\",\"name\":\"backward_4\",\"warp\":\"backward\",\"image\":\"/images/special_backward_4.svg\",\"style\":\"S6\"},{\"background_color\":\"#FFFFFF\",\"image\":\"/images/special_empty.svg\",\"style\":\"S7\"},{\"background_color\":\"#FFFFFF\",\"image\":\"\",\"style\":\"S8\"},{\"background_color\":\"#BBBBBB\",\"name\":\"backward_2_gray\",\"warp\":\"backward\",\"image\":\"/images/special_backward_2.svg\",\"style\":\"S9\"},{\"background_color\":\"#BBBBBB\",\"name\":\"forward_2_gray\",\"warp\":\"forward\",\"image\":\"/images/special_forward_2.svg\",\"style\":\"S10\"},{\"background_color\":\"#BBBBBB\",\"name\":\"backward_3_gray\",\"warp\":\"backward\",\"image\":\"/images/special_backward_3.svg\",\"style\":\"S11\"},{\"background_color\":\"#BBBBBB\",\"name\":\"forward_3_gray\",\"warp\":\"forward\",\"image\":\"/images/special_forward_3.svg\",\"style\":\"S12\"},{\"background_color\":\"#BBBBBB\",\"name\":\"backward_4_gray\",\"warp\":\"backward\",\"image\":\"/images/special_backward_4.svg\",\"style\":\"S13\"},{\"background_color\":\"#BBBBBB\",\"name\":\"forward_4_gray\",\"warp\":\"forward\",\"image\":\"/images/special_forward_4.svg\",\"style\":\"S14\"},{\"background_color\":\"#FFFFFF\",\"name\":\"idle\",\"image\":\"/images/special_idle.svg\",\"style\":\"S15\"},{\"background_color\":\"#FFFFFF\",\"image\":\"\",\"style\":\"S16\"}]');

const migratePatternsDesign = () => {
	console.log('*** starting to migrate pattern design');
	const allPatterns = Patterns.find().fetch();
	console.log('Number of patterns', allPatterns.length);
	// initially, work with one single pattern, simulation / auto
	// RabtJrCDWfpf489je from TWT1

	// check the pattern has not already been converted
	// threading has the same name in both so causes problems
	// const testPattern = Patterns.findOne({ '_id': 'RabtJrCDWfpf489je' });

	const patternsWithPatternType = [];
	const processedPatterns = [];
	const patternsMissingData = new Set();

	// make sure tags exist for each pattern type
	ALLOWED_PATTERN_TYPES.forEach((patternTypeDef) => {
		const existing = Tags.find({ 'name': patternTypeDef.name });
		if (existing.count() === 0) {
			Tags.insert({
				'name': patternTypeDef.name,
			});
		}
	});

	allPatterns.forEach((pattern) => {
		const {
			_id,
			auto_turn_sequence,
			edit_mode, // simulation, freehand or broken twill
			orientation,
			patternType,
			simulation_mode, // for simulation patterns, auto or manual
			special_styles,
			styles,
			tags,
			threading,
			weft_color,
		} = pattern;
		const holes = 4; // TWT1 only had 4-hole tablets
		const oldTags = tags || [];

		let missingData = false; // some patterns are missing threading, orientations...vital stuff...

		if (processedPatterns.indexOf(_id) !== -1) {
			console.log('*** duplicate', _id);
		}

		const update = {};

		if (patternType) {
			patternsWithPatternType.push(_id);
		} else {
			// console.log('pattern does not have patternType, so migrate it: ', _id);
			const newPatternDesign = {};
			const newPalette = DEFAULT_PALETTE;

			// number of rows, tablets have been read from old data
			// but let's make sure they are correct
			let newNumberOfRows;
			let newNumberOfTablets;
			let newOrientations;
			const newThreading = new Array(holes);
			let newPatternType;

			// palette
			if (pattern.edit_mode === 'simulation') {
				if (!orientation) {
					console.log('no orientation for', _id);
					patternsMissingData.add(_id);
					missingData = true;
				}
				if (!threading) {
					console.log('no threading for', _id);
					patternsMissingData.add(_id);
					missingData = true;
				}
				if (!styles) {
					console.log('no styles for', _id);
					patternsMissingData.add(_id);
					missingData = true;
				}

				if (missingData) {
					Patterns.remove({ _id });
				} else {
					processedPatterns.push(_id);
					const oldStyles = JSON.parse(styles);
					const oldOrientation = JSON.parse(orientation);
					const oldThreading = JSON.parse(threading);

					newNumberOfTablets = oldThreading[0].length;
					// simulation patterns only have 7 thread colours
					for (let i = 0; i < 7; i += 1) {
						newPalette[i] = oldStyles[i].background_color;
					}

					newPalette[8] = weft_color; // weft color is now saved as an indexed color in the palette. 8 is the first unused palette slot.

					// threading
					for (let i = 0; i < holes; i += 1) {
						const rowIndex = holes - i - 1; // new threading runs the other way
						newThreading[rowIndex] = new Array(newNumberOfTablets);

						for (let j = 0; j < newNumberOfTablets; j += 1) {
							const oldStyle = oldThreading[i][j];

							if (oldStyle === 'S7') {
								newThreading[rowIndex][j] = -1; // empty hole
							} else {
								newThreading[rowIndex][j] = oldStyle - 1; // old styles start at 1
							}
						}
					}

					// orientations
					newOrientations = oldOrientation.map((entry) => ((entry === 'S') ? '/' : '\\'));

					// patternDesign
					if (simulation_mode === 'auto') {
						newPatternType = 'allTogether';
						newPatternDesign.weavingInstructions = auto_turn_sequence;
						newNumberOfRows = auto_turn_sequence.length; // just in case of error in old data
					} else if (simulation_mode === 'manual') {
						//newPatternType = 'individual';
					} else {
						console.log('pattern has unrecognised simulation_mode', _id);
						console.log('simulation_mode', simulation_mode);
					}
				}
			} else if (edit_mode === 'freehand') {
				// some freehand patterns e.g. MtJ27N9QARhPwWZCP do not have special styles
				let oldSpecialStyles;
				if (special_styles) {
					oldSpecialStyles = JSON.parse(special_styles);
				}
			}

			if (newPatternType) {
				update.$set = {
					// set new fields
					'numberOfRows': newNumberOfRows,
					'numberOfTablets': newNumberOfTablets,
					'orientations': newOrientations,
					'palette': newPalette,
					'patternDesign': newPatternDesign,
					'patternType': newPatternType,
					'threading': newThreading,
					'weftColor': 8,
				};
				update.$unset = {
					// remove unused fields
					'auto_turn_sequence': '',
					'edit_mode': '',
					'number_of_rows': '',
					'number_of_tablets': '',
					'orientation': '',
					'simulation_mode': '',
					'special_styles': '',
					'styles': '',
					'weft_color': '',
				};

				const newTag = ALLOWED_PATTERN_TYPES.find((patternTypeDef) => patternTypeDef.name === newPatternType).tag;

				if (oldTags.indexOf(newTag) === -1) {
					update.$push = {
						'tags': newTag,
					};
				}

				Patterns.update({ _id }, update);
			}
		}
	});

	Patterns.remove({ '_id': patternsMissingData });
	console.log('*** report');
	console.log('!!! patternsWithPatternType ie already migrated', patternsWithPatternType);
	console.log('number of patterns migrated', processedPatterns.length);
	console.log('patterns with missing data ', patternsMissingData);
	console.log('patterns now in database', Patterns.find().count());
	console.log('*** finished migrating pattern design');
};

export default migratePatternsDesign;
