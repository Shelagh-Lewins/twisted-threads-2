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
	DEFAULT_DIRECTION,
	DEFAULT_PALETTE,
} from '../../imports/modules/parameters';

const buildSimThreading = ({
	holes,
	newNumberOfTablets,
	oldStyles,
	oldThreading,
	weft_color,
}) => {
	const newThreading = new Array(holes);
	const newPalette = [...DEFAULT_PALETTE];

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

	return {
		newPalette,
		newThreading,
	};
};

const getCellFromStyle = (styleNumber, styles) => {
	const { background_color, line_color, warp } = styles[styleNumber];
	let direction = 'F';
	let threadColor = DEFAULT_PALETTE[0];
	let threadShape;

	if (background_color.toLowerCase() === '#bbbbbb') {
		direction = 'B';
	}

	// if thread, use thread colour
	switch (warp) {
		case 'forward':
			threadColor = line_color;
			threadShape = 'forwardWarp';
			break;

		case 'backward':
			threadColor = line_color;
			threadShape = 'backwardWarp';
			break;

		case 'v_left':
			threadColor = line_color;
			threadShape = 'verticalLeftWarp';
			break;

		case 'v_center':
			threadColor = line_color;
			threadShape = 'verticalCenterWarp';
			break;

		case 'v_right':
			threadColor = line_color;
			threadShape = 'verticalRightWarp';
			break;

		case 'forward_empty':
			threadColor = ''; // this will be mapped to empty hole, -1
			threadShape = 'forwardEmpty';
			break;

		case 'backward_empty':
			threadColor = ''; // this will be mapped to empty hole, -1
			threadShape = 'backwardEmpty';
			break;

		case 'none':
			threadColor = background_color;
			threadShape = 'block';
			break;

		default:
			break;
	}

	return { direction, threadColor, threadShape };
};

// special styles don't have color
const getCellFromSpecialStyle = (styleDef, specialStyles) => {
	const thisSpecialStyle = specialStyles.find((specialStyle) => {
		if (!specialStyle) {
			return false;
		}

		return specialStyle.style === styleDef;
	});

	let style;
	if (thisSpecialStyle) {
		style = thisSpecialStyle.style;
	}

	let direction;
	let threadShape;

	switch (style) {
		case 'S1': // forward_2
			direction = 'F';
			threadShape = 'forwardWarp2';
			break;

		case 'S3': // forward_3
			direction = 'F';
			threadShape = 'forwardWarp3';
			break;

		case 'S5': // TWT2 doesn't have 4 turns // forward_4
			direction = 'F';
			threadShape = 'forwardWarp';
			break;

		case 'S2': // backward_2
			direction = 'F';
			threadShape = 'backwardWarp2';
			break;

		case 'S4': // backward_3
			direction = 'F';
			threadShape = 'backwardWarp3';
			break;

		case 'S6': // TWT2 doesn't have 4 turns // backward_4
			direction = 'F';
			threadShape = 'backwardWarp';
			break;

		case 'S10': // forward_2_gray
			direction = 'B';
			threadShape = 'forwardWarp2';
			break;

		case 'S12': // forward_3_gray
			direction = 'B';
			threadShape = 'forwardWarp3';
			break;

		case 'S14': // forward_4_gray // TWT2 doesn't have 4 turns
			direction = 'B';
			threadShape = 'forwardWarp';
			break;

		case 'S9': // backward_2_gray
			direction = 'B';
			threadShape = 'backwardWarp2';
			break;

		case 'S11': // backward_3_gray
			direction = 'B';
			threadShape = 'backwardWarp3';
			break;

		case 'S13': // backward_4_gray // TWT2 doesn't have 4 turns
			direction = 'B';
			threadShape = 'backwardWarp';
			break;

		case 'S15': // idle
			direction = 'F';
			threadShape = 'idle';
			break;

		case 'S7': // empty 'X'
			direction = 'F';
			threadShape = 'forwardEmpty';
			break;

		default: // S8, S16 are blank
			direction = 'F';
			threadShape = 'block';
			break;
	}

	return { direction, threadShape };
};

const migratePatternsDesign = () => {
	console.log('*** starting to migrate pattern design');
	const allPatterns = Patterns.find().fetch();
	console.log('Number of patterns', allPatterns.length);
	const patternsWithPatternType = [];
	const processedPatterns = [];
	const patternsMissingData = [];
	const freehandMissingData = [];

	const allTogetherPatterns = [];
	const individualPatterns = [];
	const brokenTwillPatterns = [];
	const freehandPatterns = [];

	const unrecognisedEditModePatterns = [];

	// make sure tags exist for each pattern type
	ALLOWED_PATTERN_TYPES.forEach((patternTypeDef) => {
		const existing = Tags.find({ 'name': patternTypeDef.tag });
		if (existing.count() === 0) {
			Tags.insert({
				'name': patternTypeDef.tag,
			});
		}
	});

	const manualWithNoRows = [];

	allPatterns.forEach((pattern) => {
		const {
			_id,
			auto_turn_sequence, // pattern design for simulation/auto, now all together
			edit_mode, // simulation, freehand or broken twill#
			manual_weaving_turns, // pattern design for simulation/manual, now individual
			orientation,
			patternType,
			simulation_mode, // for simulation patterns, auto or manual
			special_styles,
			styles,
			tags,
			threading, // note name is the same in both schemes
			twill_change_chart,
			twill_direction,
			twill_pattern_chart,
			weaving_start_row,
			weaving,
			weft_color,
		} = pattern;
		const holes = 4; // TWT1 only had 4-hole tablets
		const oldTags = tags || [];
		const update = {};

		if (patternType) {
			// pattern has already been migrated
			patternsWithPatternType.push(_id);
		} else if (!orientation || !threading || !styles) {
			patternsMissingData.push(_id);
		} else {
			const newPatternDesign = {};
			let newPatternType;
			const newOrientations = JSON.parse(orientation).map((entry) => ((entry === 'S') ? '/' : '\\'));
			const oldStyles = JSON.parse(styles);
			const oldThreading = JSON.parse(threading);
			let newNumberOfTablets = oldThreading[0].length;
			let newNumberOfRows;
			let weftColor = 8; // for everything except freehand

			let newPalette;
			let newThreading;

			if (edit_mode === 'simulation') {
				({
					newPalette,
					newThreading,
				} = buildSimThreading({
					holes,
					newNumberOfTablets,
					oldStyles,
					oldThreading,
					weft_color,
				}));

				if (simulation_mode === 'auto') {
					newPatternType = 'allTogether';
					processedPatterns.push(_id);
					allTogetherPatterns.push(_id);
					newPatternDesign.weavingInstructions = auto_turn_sequence;
					newNumberOfRows = auto_turn_sequence.length; // just in case of error in old data
				} else if (simulation_mode === 'manual') {
					// manual patterns have a dummy row at start for working
					// so only one row means the pattern has not been designed
					const oldTurns = JSON.parse(manual_weaving_turns);
					newNumberOfRows = oldTurns.length - 1;

					if (newNumberOfRows < 1) {
						manualWithNoRows.push(_id);
						patternsMissingData.push(_id);
					} else {
						newPatternType = 'individual';
						individualPatterns.push(_id);
						processedPatterns.push(_id);
						const weavingInstructions = []; // these will be built by row from manual_weaving_turns

						// manual patterns have a dummy row at start for working
						for (let i = 0; i < newNumberOfRows; i += 1) {
							weavingInstructions[i] = [];
							const { tablets, packs } = oldTurns[i + 1];

							for (let j = 0; j < tablets.length; j += 1) {
								const oldPick = packs[tablets[j] - 1];
								const newPick = {
									'direction': oldPick.direction,
									'numberOfTurns': oldPick.number_of_turns,
								};
								weavingInstructions[i][j] = newPick;
							}
						}

						newPatternDesign.weavingInstructions = weavingInstructions;
					}
				} else {
					console.log('pattern has unrecognised simulation_mode', _id);
					console.log('simulation_mode', simulation_mode);
					patternsMissingData.push(_id);
				}
			} else if (edit_mode === 'broken_twill') {
				if (!twill_direction
					|| !twill_pattern_chart
					|| !twill_change_chart) {
					console.log('missing twill data for', _id);
					patternsMissingData.push(_id);
				} else {
					({
						newPalette,
						newThreading,
					} = buildSimThreading({
						holes,
						newNumberOfTablets,
						oldStyles,
						oldThreading,
						weft_color,
					}));

					newPatternType = 'brokenTwill';
					processedPatterns.push(_id);
					brokenTwillPatterns.push(_id);
					const twillPatternChart = JSON.parse(twill_pattern_chart);
					const twillDirectionChangeChart = JSON.parse(twill_change_chart);

					// twill charts have an extra row at the end for determining the last even row
					newNumberOfRows = (twillPatternChart.length - 1) * 2;
					newPatternDesign.twillDirection = twill_direction;
					newPatternDesign.twillPatternChart = twillPatternChart;
					newPatternDesign.twillDirectionChangeChart = twillDirectionChangeChart;
					newPatternDesign.weavingStartRow = weaving_start_row || 1;
				}
			} else if (!edit_mode
				|| edit_mode === 'freehand'
				|| edit_mode === 'Submit Query') {
				//if (!edit_mode) console.log('default freehand', _id);
				// first patterns didn't have edit_mode because there was only freehand
				const oldWeaving = JSON.parse(weaving);

				// pattern jf5urvTWiexbsbeMf has extra null threading cells that extend beyond weaving
				newNumberOfTablets = oldWeaving[0].length;

				if (!weaving) {
					console.log('missing freehand weaving for', _id);
					patternsMissingData.push(_id);
					freehandMissingData.push(_id);
				} else {
					// build threading chart and palette
					// some freehand patterns e.g. MtJ27N9QARhPwWZCP do not have special styles
					let oldSpecialStyles;
					if (special_styles) {
						oldSpecialStyles = JSON.parse(special_styles);
					}

					newThreading = new Array(holes);
					newNumberOfRows = oldWeaving.length;
					newPalette = new Array(DEFAULT_PALETTE.length);
					const freehandDefaultColor = '#ffffff';
					newPalette[0] = freehandDefaultColor; // ensure we have white as a fallback
					const freehandChart = [];

					let nextPaletteIndex = 1; // keep track of colours we've migrated from the old styles to the new palette
					// so we know where to insert pattern colours

					for (let i = 0; i < holes; i += 1) {
						const rowIndex = holes - i - 1; // new threading runs the other way
						newThreading[rowIndex] = new Array(newNumberOfTablets);

						// threading for freehand in TWT2 is the same as threading for simulation patterns - a palette colour, or empty hole
						// so translate as best as possible
						for (let j = 0; j < newNumberOfTablets; j += 1) {
							const style = oldThreading[i][j];
							let styleNumber;

							if (style && style[0] !== 'S') {
								styleNumber = style - 1;
							}

							let newPaletteIndex = 0; // default colour

							newThreading[rowIndex][j] = 0; // default for null entry, missing styles or special styles
							// special styles cannot be edited, and have no thread colour

							if (styleNumber) { // regular style
								if (oldStyles) {
									const { threadColor } = getCellFromStyle(styleNumber, oldStyles);

									if (threadColor === '') { // empty hole
										newPaletteIndex = -1;
									} else {
										// is this colour already in the palette?
										const paletteIndex = newPalette.indexOf(threadColor);
										if (paletteIndex !== -1) {
											newPaletteIndex = paletteIndex;
										} else if (nextPaletteIndex < DEFAULT_PALETTE.length) {
											// add this color to the palette
											// if we've run out of colors, the default will be used
											newPalette[nextPaletteIndex] = threadColor;
											newPaletteIndex = nextPaletteIndex;
											nextPaletteIndex += 1;
										}
									}
								}
							}

							newThreading[rowIndex][j] = newPaletteIndex;
						}
					}

					// build weaving chart
					for (let i = 0; i < newNumberOfRows; i += 1) {
						freehandChart[i] = [];

						for (let j = 0; j < newNumberOfTablets; j += 1) {
							const oldStyle = oldWeaving[i][j];
							let newPaletteIndex = 0; // default colour
							let direction;
							let threadColor;
							let threadShape;

							if (!oldStyle) {
								// null entry, something went wrong in pattern data
								direction = DEFAULT_DIRECTION;
								threadColor = freehandDefaultColor;
								threadShape = 'forwardWarp';
							} else if (oldStyle[0] === 'S') { // special style
								({ direction, threadShape } = getCellFromSpecialStyle(oldStyle, oldSpecialStyles));
								threadColor = 0;
							} else {
								({ direction, threadColor, threadShape } = getCellFromStyle(oldStyle - 1, oldStyles));

								// threadColor is a hex value. Need to convert to a palette index.
								if (threadColor === '') { // empty hole
									newPaletteIndex = -1;
								} else {
									// is this colour already in the palette?
									const paletteIndex = newPalette.indexOf(threadColor);
									if (paletteIndex !== -1) {
										newPaletteIndex = paletteIndex;
									} else if (nextPaletteIndex < DEFAULT_PALETTE.length) {
										// add this color to the palette
										// if we've run out of colors, the default will be used
										newPalette[nextPaletteIndex] = threadColor;
										newPaletteIndex = nextPaletteIndex;
										nextPaletteIndex += 1;
									}
								}
							}

							freehandChart[i][j] = {
								direction,
								'threadColor': newPaletteIndex,
								threadShape,
							};
						}
					}

					// fill blanks with default colour
					for (let i = 0; i < DEFAULT_PALETTE.length; i += 1) {
						if (!newPalette[i]) {
							newPalette[i] = freehandDefaultColor;
						}
					}

					newPatternType = 'freehand';
					newPatternDesign.freehandChart = freehandChart;
					processedPatterns.push(_id);
					freehandPatterns.push(_id);
				}
			} else {
				unrecognisedEditModePatterns.push(_id);
				console.log('weird edit_mode', edit_mode);
				console.log('for pattern id', _id);
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
					weftColor,
				};
				update.$unset = {
					// remove unused fields
					'auto_turn_sequence': '',
					'auto_turn_threads': '',
					'edit_mode': '',
					'manual_weaving_threads': '',
					'manual_weaving_turns': '',
					'orientation': '',
					'position_of_A': '',
					'simulation_mode': '',
					'special_styles': '',
					'styles': '',
					'twill_direction': '',
					'twill_change_chart': '',
					'twill_pattern_chart': '',
					'weaving': '',
					'weaving_start_row': '',
					'weft_color': '',
				};

				const newTag = ALLOWED_PATTERN_TYPES.find((patternTypeDef) => patternTypeDef.name === newPatternType).tag;

				if (oldTags.indexOf(newTag) === -1) {
					update.$push = {
						'tags': newTag,
					};
				}

				Patterns.update({ _id }, update);
			} else if (newNumberOfRows) {
				console.log('missing patternType for ', _id);
			}
		}
	});

	Patterns.remove({ '_id': { '$in': patternsMissingData } });
	console.log('*** report');

	console.log('number of patterns migrated', processedPatterns.length);
	console.log('patterns with missing data ', patternsMissingData.length);
	console.log('unrecognisedEditModePatterns', unrecognisedEditModePatterns);
	const totalPatternsLogged = processedPatterns.length + patternsMissingData.length + unrecognisedEditModePatterns.length;
	console.log('');
	console.log('allTogetherPatterns', allTogetherPatterns.length);
	console.log('individualPatterns', individualPatterns.length);
	console.log('brokenTwillPatterns', brokenTwillPatterns.length);
	console.log('freehandPatterns', freehandPatterns.length);

	console.log('');

	console.log('patterns now in database', Patterns.find().count());
	console.log('!!! check: migrated patterns equals total now in database', (Patterns.find().count() === processedPatterns.length));
	console.log('!!! check: migrated patterns + rejected patterns should equal oroginal number of patterns', totalPatternsLogged);
	console.log('*** finished migrating pattern design');
};

export default migratePatternsDesign;
