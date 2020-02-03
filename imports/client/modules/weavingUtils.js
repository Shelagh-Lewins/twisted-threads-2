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

export const getNumberOfRows = (pattern) => pattern.numberOfRows;

export const getNumberOfTablets = (pattern) => pattern.numberOfTablets;

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

export const calculatePicksForTablet = (weavingInstructionsForTablet, numberOfRows) => {
	const picks = [];

	for (let i = 0; i < numberOfRows; i += 1) {
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

// recalculate picks for the tablet
// from the row of the change onward
export const reCalculatePicksForTablet = ({
	currentPicks,
	weavingInstructionsForTablet,
	row,
}) => {
	const picks = [...currentPicks].slice(0, row);
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
		const picksForTablet = calculatePicksForTablet(weavingInstructionsByTablet[i], numberOfRows);
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

export const findPatternTwist = ({
	holes,
	numberOfRows,
	numberOfTablets,
	picks,
}) => {
	let patternWillRepeat = false;
	let patternIsTwistNeutral = false;

	if (picks[0]) {
		patternWillRepeat = true;
		patternIsTwistNeutral = true;

		for (let j = 0; j < numberOfTablets; j += 1) {
			const { totalTurns } = picks[j][numberOfRows - 1];
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

export const buildTwillDoubledCharts = ({
	numberOfTablets,
	twillPatternChart,
	twillDirectionChangeChart,
}) => {
	// each row of raw pattern design charts corresponds to two picks, offset alternately
	// so build expanded charts that correspond to single picks
	const doubledPatternChart = [];
	const doubledChangeChart = [];
	const designChartRows = twillPatternChart.length; // the charts have an extra row because of offset
//console.log('buildTwillDoubledCharts');
//console.log('designChartRows', designChartRows);
	for (let i = 0; i < designChartRows; i += 1) {
		const evenPatternRow = [];
		const oddPatternRow = [];
		const evenChangeRow = [];
		const oddChangeRow = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			// pattern chart
			// even row
			evenPatternRow.push(twillPatternChart[i][j]);

			// odd row
			if (i === (designChartRows - 1)) { // last row of Data
				oddPatternRow.push(twillPatternChart[i][j]);
			} else if (j % 2 === 0) {
				oddPatternRow.push(twillPatternChart[i][j]);
			} else {
				oddPatternRow.push(twillPatternChart[i + 1][j]);
			}

			// change chart
			// even row
			evenChangeRow.push(twillDirectionChangeChart[i][j]);

			// chart cells are alternately offset, so this finds the second pick in a pair
			// replace X with Y in second row so we can identify first and second row of changed twill
			if (j % 2 === 1) {
				if (evenChangeRow[j] === 'X') {
					evenChangeRow[j] = 'Y';
				}
			}

			// odd row
			if (i === (designChartRows - 1)) { // last row of twill direction change chart
				oddChangeRow.push(twillDirectionChangeChart[i][j]);
			} else if (j % 2 === 0) {
				oddChangeRow.push(twillDirectionChangeChart[i][j]);
			} else {
				oddChangeRow.push(twillDirectionChangeChart[i + 1][j]);
			}

			// replace X with Y in second row so we can identify first and second row of long float
			if ((j % 2 === 0)) {
				if (oddChangeRow[j] === 'X') {
					oddChangeRow[j] = 'Y';
				}
			}
		}

		doubledPatternChart.push(evenPatternRow);
		doubledPatternChart.push(oddPatternRow);
		doubledChangeChart.push(evenChangeRow);
		doubledChangeChart.push(oddChangeRow);
	}
console.log('doubledPatternChart', doubledPatternChart);
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

// 3/1 broken twill patterns are defined by two charts
// note that twill direction change is the TWT name for GTT's long floats
export const buildTwillWeavingInstructionsByTablet = ({
	numberOfRows,
	numberOfTablets,
	patternDesign,
}) => {
	const {
		twillDirection,
		twillPatternChart,
		twillDirectionChangeChart,
	} = patternDesign;
//console.log('got PatternDesign', patternDesign);
	const {
		doubledChangeChart,
		doubledPatternChart,
	} = buildTwillDoubledCharts({
		numberOfTablets,
		twillPatternChart,
		twillDirectionChangeChart,
	});
//console.log('doubledChangeChart', doubledChangeChart);
//console.log('doubledPatternChart', doubledPatternChart);
	// build the weaving instructions
	const weavingInstructionsByTablet = [];
	const twillPosition = []; // TODO maybe build this into weavingInstructions? Tracks twillPosition of last woven row

	// for each tablet, what stage is it at in the twill_sequence? 0, 1, 2, 3
	// set the start row
	// tablets start with the previous row, so that if there is a color change in row 1, they will continue as in the non-existent previous row
	for (let i = 0; i < numberOfTablets; i += 1) {
		switch (twillDirection) {
			case 'S':
				twillPosition.push((i + 3) % 4);
				break;

			case 'Z':
				twillPosition.push(3 - ((i + 0) % 4));
				break;

			default:
				console.log(`Error: unknown twill direction: ${twillDirection}`);
				break;
		}

		// for this tablet, chart each row
		const newTablet = [];

		for (let j = 0; j < numberOfRows; j += 1) {
			// read the pattern chart for colour change
			// '.' is background colour
			// 'X' is foreground colour
			const currentColor = doubledPatternChart[j][i];
			let nextColor = currentColor;
			let lastColor = '.';
			let colorChange = false;

			if (j < (numberOfRows - 1)) { // last row has no next row
				nextColor = doubledPatternChart[j + 1][i]; // problem
			}

			if (j > 0) {
				lastColor = doubledPatternChart[j - 1][i];
			}

			if (nextColor !== currentColor) {
				colorChange = true;
			}

			if (lastColor !== currentColor) {
				colorChange = true;
				if (j === 0) { // tablet starts with foreground color
					twillPosition[i] = (twillPosition[i] + 3) % 4; // go back an extra turn
				}
			}
			if (i === 0) {
console.log('*** row', j);
console.log('*** tablet', i);
console.log('lastColor', lastColor);
console.log('currentColor', currentColor);
console.log('nextColor', nextColor);
console.log('colour change', colorChange);
}
			const twillChange = doubledChangeChart[j][i];

			// handle long floats
			// advance in turning sequence
			if ((!colorChange)) {
				twillPosition[i] = (twillPosition[i] + 1) % 4;
			}
			if (i === 0) {
console.log('twillPosition', twillPosition[i]);
}

			if ((twillChange === 'Y')) { // second pick of long float
				twillPosition[i] = (twillPosition[i] + 2) % 4;
			}

			const position = twillPosition[i];
			const direction = BROKEN_TWILL_SEQUENCE[position];
			if (i === 0) {
console.log('direction', direction);
}
			newTablet.push({
				direction,
				position,
				'numberOfTurns': 1,
			});
		}

		weavingInstructionsByTablet.push(newTablet);
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
