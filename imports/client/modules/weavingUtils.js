// functions used to calculate weaving chart from pattern design
import { createSelector } from 'reselect';

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
const getPattern = (pattern) => pattern || {};

export const getNumberOfRows = (pattern) => pattern.numberOfRows;

export const getNumberOfTablets = (pattern) => pattern.numberOfTablets;

export const getWeavingInstructionsForTablet = (pattern, tabletIndex) => {
	const {
		patternDesign,
		patternType,
		numberOfRows,
	} = pattern;

	const weavingInstructionsForTablet = [];

	switch (patternType) {
		case 'individual':
			for (let i = 0; i < numberOfRows; i += 1) {
				weavingInstructionsForTablet[i] = patternDesign.weavingInstructions[i][tabletIndex];
			}
			break;

		default:
			break;
	}

	return weavingInstructionsForTablet;
};

const getPicksForTablet = createSelector(
	[getWeavingInstructionsForTablet, getNumberOfRows],
	(weavingInstructionsForTablet, numberOfRows) => {
		const picks = [];

		for (let i = 0; i < numberOfRows; i += 1) {
			const { direction, numberOfTurns } = weavingInstructionsForTablet[i];

			picks[i] = turnTablet({
				'direction': direction,
				'numberOfTurns': numberOfTurns,
				'totalTurns': i === 0
					? 0
					: picks[i - 1].totalTurns,
			});
		}

		return picks;
	},
);

export const getPicksByTablet = createSelector(
	[getPattern, getNumberOfTablets],
	(pattern, numberOfTablets) => {
		// weave by tablet instead of by row
		// so that an individual tablet can be rewoven
		// without recalculating other tablets
		if (!pattern.patternDesign) {
			return [];
		}

		const picksByTablet = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			const picksForTablet = getPicksForTablet(pattern, j);
			picksByTablet.push(picksForTablet);
		}

		return picksByTablet;
	},
);

// a tablet to be deleted has its colorIndex temporarily set to a marker value which causes an error in threading and weaving charts
export const isValidColorIndex = (colorIndex) => typeof colorIndex === 'number';

// set a text color that will show up against a background
export const contrastingColor = (color) => (tinycolor(color).isLight() ? '#000' : '#fff');
