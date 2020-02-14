// functions used to calculate weaving chart from pattern design
// import { createSelector } from 'reselect';
import {
	BROKEN_TWILL_SEQUENCE,
	EMPTY_HOLE_COLOR,
	MAX_PICKS_IN_REPEAT,
} from '../../modules/parameters';

const tinycolor = require('tinycolor2');

// /////////////////////////
// utilities
// calculate the effect of turning a tablet to weave one pick

// direction: 'F', 'B'
// number of turns: how many times the tablet has been turned this pick - 0, 1, 2, 3
// totalTurns: total number of turns the tablet has been given, including this pick
export const turnTablet = ({ direction, numberOfTurns, totalTurns = 0 }) => (
	{
		direction,
		numberOfTurns,
		'totalTurns': direction === 'F'
			? totalTurns + numberOfTurns
			: totalTurns - numberOfTurns,
	}
);

// find n modulus m
// handles negative numbers
// e.g. -5 mod 4 returns 3
export const modulus = (n, m) => ((n % m) + m) % m;

// ///////////////////////////
// provide weaving data to components
// const getPattern = (pattern) => pattern || {};

export const getWeavingInstructionsForTablet = (pattern, tabletIndex) => pattern.weavingInstructionsByTablet[tabletIndex];

// recast threading by tablet, row
// better for getting data per tablet
export const getThreadingByTablet = (pattern) => {
	const {
		holes,
		numberOfTablets,
		threading,
	} = pattern;

	const threadingByTablet = [];

	for (let i = 0; i < numberOfTablets; i += 1) {
		const threadingForTablet = [];

		for (let j = 0; j < holes; j += 1) {
			threadingForTablet.push(threading[j][i]);
		}
		threadingByTablet.push(threadingForTablet);
	}

	return threadingByTablet;
};

// calculate picks for the tablet
// from scratch, or
// from the row of a change onward
export const calculatePicksForTablet = ({
	currentPicks,
	weavingInstructionsForTablet,
	row,
}) => {
	let picks = []; // build picks from scratch

	if (currentPicks) { // rebuild picks from row onwards
		picks = [...currentPicks].slice(0, row);
	}

	const numberOfRows = weavingInstructionsForTablet.length;

	for (let i = row; i < numberOfRows; i += 1) {
		const { direction, numberOfTurns } = weavingInstructionsForTablet[i];

		let adjustedDirection = direction;

		// idle tablet
		if (numberOfTurns === 0) {
			if (i === 0) {
				// first row: take direction from the following pick
				// because idle, forward is the same as forward, idle
				// will fail if pattern starts with two idles
				// but that doesn't seem a common scenario
				adjustedDirection = weavingInstructionsForTablet[i + 1].direction;
			} else {
				// use direction of previous row
				adjustedDirection = picks[i - 1].direction;
			}
		}

		picks[i] = turnTablet({
			'direction': adjustedDirection,
			'numberOfTurns': numberOfTurns,
			'totalTurns': i === 0
				? 0
				: picks[i - 1].totalTurns,
		});
	}

	return picks;
};

export const calculateAllPicks = ({
	numberOfRows,
	numberOfTablets,
	weavingInstructionsByTablet,
}) => {
	// weave by tablet instead of by row
	// so that an individual tablet can be rewoven
	// without recalculating other tablets
	const picks = [];

	for (let i = 0; i < numberOfTablets; i += 1) {
		const picksForTablet = calculatePicksForTablet({
			'weavingInstructionsForTablet': weavingInstructionsByTablet[i],
			'row': 0,
			numberOfRows,
		});

		picks.push(picksForTablet);
	}

	return picks;
};

// a tablet to be deleted has its colorIndex temporarily set to a marker value which causes an error in threading and weaving charts
export const isValidColorIndex = (colorIndex) => typeof colorIndex === 'number';

// set a text color that will show up against a background
export const contrastingColor = (color) => (tinycolor(color).isLight() ? '#000' : '#fff');

// find the color of a previous thread
// offset 1 means last thread
// offset 2 means last but one thread...
export const getPrevColor = ({
	direction,
	holes,
	holeToShow,
	offset,
	palette,
	threadingForTablet,
}) => {
	let prevHoleIndex = direction === 'F' ? holeToShow + offset : holeToShow - offset;
	prevHoleIndex = modulus(prevHoleIndex, holes);

	const colorIndex = threadingForTablet[prevHoleIndex];

	if (colorIndex === -1) {
		return EMPTY_HOLE_COLOR;
	}

	return palette[colorIndex];
};

export const getTotalTurnsForTablet = ({
	numberOfRows,
	patternDesign,
	patternType,
	picksForTablet,
}) => {
	let startTurns = 0;

	if (patternType === 'brokenTwill') {
		const { weavingStartRow } = patternDesign;

		if (weavingStartRow > 1) {
			startTurns = picksForTablet[weavingStartRow - 2].totalTurns;
		}
	}
	return picksForTablet[numberOfRows - 1].totalTurns - startTurns;
};

export const findPatternTwist = ({
	holes,
	numberOfRows,
	numberOfTablets,
	patternDesign,
	patternType,
	picks,
}) => {
	let patternWillRepeat = false;
	let patternIsTwistNeutral = false;

	if (patternType !== 'freehand') {
		if (picks[0]) {
			patternWillRepeat = true;
			patternIsTwistNeutral = true;

			for (let j = 0; j < numberOfTablets; j += 1) {
				const totalTurns = getTotalTurnsForTablet({
					numberOfRows,
					patternDesign,
					patternType,
					'picksForTablet': picks[j],
				});

				const startPosition = modulus(totalTurns, holes) === 0; // tablet is back at start position

				if (totalTurns !== 0) {
					patternIsTwistNeutral = false;
				}

				if (!startPosition) {
					patternWillRepeat = false;
				}

				if (!patternIsTwistNeutral && !patternWillRepeat) {
					break;
				}
			}
		}
	}

	return { patternWillRepeat, patternIsTwistNeutral };
};

export const getNumberOfRepeats = (numberOfRows) => {
	if (numberOfRows <= MAX_PICKS_IN_REPEAT) {
		return Math.floor((2 * MAX_PICKS_IN_REPEAT) / numberOfRows);
	}
	return 1;
};

// find the thread to show for a particular pick
export const getThread = ({
	direction,
	emptyHoleColor,
	holes,
	netTurns,
	orientation,
	palette,
	threadingForTablet,
}) => {
	let holeToShow;

	// I'm not sure if this is right or whether an idling first row should be adjusted, as in the commented-out code below. This seems to work for Cambridge Diamonds, so leave as is for now.
	// idle first row: tablet has not yet turned.
	// so go back one hole
	if (direction === 'F') { // not first row, or not idle
		// show thread in position A
		holeToShow = modulus(holes - netTurns, holes);
	} else {
		// show thread in position D
		holeToShow = modulus(holes - netTurns - 1, holes);
	}

	const colorIndex = threadingForTablet[holeToShow];

	if (!isValidColorIndex(colorIndex)) {
		return null;
	}

	let threadColor = emptyHoleColor;
	if (colorIndex !== -1) { // not empty, there is a thread
		threadColor = palette[colorIndex];
	}

	let threadAngle = '/'; // which way does the thread twist?

	if (direction === 'F') {
		if (orientation === '\\') {
			threadAngle = '\\';
		}
	} else if (orientation === '/') {
		threadAngle = '\\';
	}

	return {
		colorIndex,
		holeToShow,
		threadAngle,
		threadColor,
	};
};

// each row of raw pattern design charts corresponds to two picks, offset alternately
// so build expanded charts that correspond to single picks
// and recast by tablet
export const buildTwillDoubledChartsForTablet = ({
	tabletIndex,
	twillPatternChart,
	twillDirectionChangeChart,
}) => {
	const doubledChangeChart = [];
	const doubledPatternChart = [];
	const designChartRows = twillPatternChart.length; // the charts have an extra row because of offset

	for (let i = 0; i < designChartRows; i += 1) {
		// pattern chart
		// even row (note chart starts with 0, even)
		doubledPatternChart.push(twillPatternChart[i][tabletIndex]);
		const rowIndex = 2 * i; // row index in doubled chart

		// odd row
		if (i === (designChartRows - 1)) { // last row of Data
			doubledPatternChart.push(twillPatternChart[i][tabletIndex]);
		} else if (tabletIndex % 2 === 0) {
			doubledPatternChart.push(twillPatternChart[i][tabletIndex]);
		} else {
			doubledPatternChart.push(twillPatternChart[i + 1][tabletIndex]);
		}

		// change chart
		// even row
		doubledChangeChart.push(twillDirectionChangeChart[i][tabletIndex]);

		// chart cells are alternately offset, so this finds the second pick in a pair
		// replace X with Y in second row so we can identify first and second row of changed twill
		if (tabletIndex % 2 === 1) {
			if (doubledChangeChart[rowIndex] === 'X') {
				doubledChangeChart[rowIndex] = 'Y';
			}
		}

		// odd row
		if (i === (designChartRows - 1)) { // last row of twill direction change chart
			doubledChangeChart.push(twillDirectionChangeChart[i][tabletIndex]);
		} else if (tabletIndex % 2 === 0) {
			doubledChangeChart.push(twillDirectionChangeChart[i][tabletIndex]);
		} else {
			doubledChangeChart.push(twillDirectionChangeChart[i + 1][tabletIndex]);
		}

		// replace X with Y in second row so we can identify first and second row of long float
		if ((tabletIndex % 2 === 0)) {
			if (doubledChangeChart[rowIndex + 1] === 'X') {
				doubledChangeChart[rowIndex + 1] = 'Y';
			}
		}
	}

	return {
		doubledChangeChart,
		doubledPatternChart,
	};
};

export const buildIndividualWeavingInstructionsByTablet = ({
	numberOfRows,
	numberOfTablets,
	patternDesign,
}) => {
	const weavingInstructionsByTablet = [];

	for (let i = 0; i < numberOfTablets; i += 1) {
		const weavingInstructionsForTablet = [];

		for (let j = 0; j < numberOfRows; j += 1) {
			weavingInstructionsForTablet.push(patternDesign.weavingInstructions[j][i]);
		}

		weavingInstructionsByTablet.push(weavingInstructionsForTablet);
	}

	return weavingInstructionsByTablet;
};

export const buildAllTogetherWeavingInstructionsByTablet = ({
	numberOfRows,
	numberOfTablets,
	patternDesign,
}) => {
	const weavingInstructionsByTablet = [];

	for (let i = 0; i < numberOfTablets; i += 1) {
		const weavingInstructionsForTablet = [];

		// pattern design gives direction of turn for the entire row
		// always 1 turn
		for (let j = 0; j < numberOfRows; j += 1) {
			const instruction = {
				'direction': patternDesign.weavingInstructions[j],
				'numberOfTurns': 1,
			};

			weavingInstructionsForTablet.push(instruction);
		}

		weavingInstructionsByTablet.push(weavingInstructionsForTablet);
	}

	return weavingInstructionsByTablet;
};

// This is the magic function that defines 3/1 broken twill weaving
// 3/1 broken twill patterns are defined by two charts
// note that twill direction change is the TWT name for GTT's long floats
// build the weaving instructions for a tablet
// from the specified row
export const buildTwillWeavingInstructionsForTablet = ({
	numberOfRows,
	patternDesign,
	startRow, // this is weaving chart row, not pattern chart row
	tabletIndex,
	weavingInstructionsForTablet,
}) => {
	const {
		twillDirection,
		twillPatternChart,
		twillDirectionChangeChart,
	} = patternDesign;

	const weavingInstructions = weavingInstructionsForTablet || [];
	let position;

	const {
		doubledChangeChart,
		doubledPatternChart,
	} = buildTwillDoubledChartsForTablet({
		tabletIndex,
		twillDirectionChangeChart,
		twillPatternChart,
	});

	if (startRow === 0) {
	// set the tablet's start position
		switch (twillDirection) {
			case 'S':
				position = (tabletIndex + 3) % 4;
				break;

			case 'Z':
				position = 3 - ((tabletIndex + 0) % 4);
				break;

			default:
				console.log(`Error: unknown twill direction: ${twillDirection}`);
				break;
		}
	} else {
		position = (weavingInstructions[startRow - 1].position) % 4;
	}

	for (let i = startRow; i < numberOfRows; i += 1) {
		// read the pattern chart for colour change
		// '.' is background colour
		// 'X' is foreground colour

		const currentColor = doubledPatternChart[i];
		let nextColor = currentColor;
		let prevColor = '.';
		let colorChange = false;

		if (i < (numberOfRows - 1)) { // last row has no next row
			nextColor = doubledPatternChart[i + 1];
		}

		if (i > 0) {
			prevColor = doubledPatternChart[i - 1];
		}

		// color change if either previous or next color is different
		if (nextColor !== currentColor) {
			colorChange = true;
		}

		if (prevColor !== currentColor) {
			colorChange = true;
			if (i === 0) { // tablet starts with foreground color
				position = (position + 3) % 4; // go back an extra turn
			}
		}

		const twillChange = doubledChangeChart[i];// read the change chart for twill direction change
		// '.' is no change
		// 'X' is first pick of change, 'Y' is second pick of change

		if ((!colorChange)) { // if there is a color change, just keep turning the same way, otherwise advance in twill sequence
			position = (position + 1) % 4;
		}

		if ((twillChange === 'Y')) { // second pick of twill direction change
			position = (position + 2) % 4;
		}

		const direction = BROKEN_TWILL_SEQUENCE[position];

		weavingInstructions[i] = {
			direction,
			position,
			'numberOfTurns': 1,
		};
	}

	return weavingInstructions;
};

export const buildTwillWeavingInstructionsByTablet = ({
	numberOfRows,
	numberOfTablets,
	patternDesign,
}) => {
	// build the weaving instructions
	const weavingInstructionsByTablet = [];

	for (let i = 0; i < numberOfTablets; i += 1) {
		const weavingInstructionsForTablet = buildTwillWeavingInstructionsForTablet({
			numberOfRows,
			patternDesign,
			'startRow': 0,
			'tabletIndex': i,
		});

		weavingInstructionsByTablet.push(weavingInstructionsForTablet);
	}

	return weavingInstructionsByTablet;
};

export const buiildWeavingInstructionsByTablet = ({
	numberOfRows,
	numberOfTablets,
	patternDesign,
	patternType,
}) => {
	// build weaving instructions from pattern design
	// recast to be by tablet, row
	// which is better for manipulating weaving instructions
	// instead of the more human-readable row, tablet
	// that is saved in the database
	let weavingInstructionsByTablet;

	switch (patternType) {
		case 'individual':
			weavingInstructionsByTablet = buildIndividualWeavingInstructionsByTablet({
				numberOfRows,
				numberOfTablets,
				patternDesign,
			});
			break;

		case 'allTogether':
			weavingInstructionsByTablet = buildAllTogetherWeavingInstructionsByTablet({
				numberOfRows,
				numberOfTablets,
				patternDesign,
			});
			break;

		case 'brokenTwill':
			weavingInstructionsByTablet = buildTwillWeavingInstructionsByTablet({
				numberOfRows,
				numberOfTablets,
				patternDesign,
			});
			break;

		default:
			break;
	}

	return weavingInstructionsByTablet;
};

export const buildTwillOffsetThreadingForTablet = ({
	holes,
	pick,
	threadingForTablet,
	weavingStartRow,
}) => {
	const offsetThreadingForTablet = [];
	let tabletOffset = 0;

	if (weavingStartRow > 1) {
		tabletOffset = pick[weavingStartRow - 2].totalTurns;
	}

	for (let j = 0; j < holes; j += 1) {
		offsetThreadingForTablet.push(threadingForTablet[modulus(j + tabletOffset, holes)]);
	}

	return offsetThreadingForTablet;
};

export const buildTwillOffsetThreading = ({
	holes,
	numberOfTablets,
	picks,
	threadingByTablet,
	weavingStartRow,
}) => {
	const offsetThreadingByTablets = [];

	for (let i = 0; i < numberOfTablets; i += 1) {
		offsetThreadingByTablets.push(buildTwillOffsetThreadingForTablet({
			holes,
			'pick': picks[i],
			'threadingForTablet': threadingByTablet[i],
			weavingStartRow,
		}));
	}

	return offsetThreadingByTablets;
};
