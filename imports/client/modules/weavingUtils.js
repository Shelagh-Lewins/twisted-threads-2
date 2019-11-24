// functions used to calculate weaving chart from pattern design
import { createSelector } from 'reselect';

// /////////////////////////
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

export const getPicksFromPattern = (({ patternDesign, patternType }) => {
	// console.log('pattern', pattern);

	let numberOfRows;
	let numberOfTablets;
	const picks = [];
	let weavingInstructions;

	switch (patternType) {
		case 'individual':
			// calculate totalTurns for each pick
			weavingInstructions = patternDesign.weavingInstructions;

			numberOfRows = weavingInstructions.length;
			numberOfTablets = weavingInstructions[0].length;

			for (let i = 0; i < numberOfRows; i += 1) {
				picks[i] = [];

				for (let j = 0; j < numberOfTablets; j += 1) {
					/* picks[i][j] = {
						'direction': weavingInstructions[i][j].direction,
						'numberOfTurns': weavingInstructions[i][j].numberOfTurns,
					}; */

					picks[i][j] = turnTablet({
						'direction': weavingInstructions[i][j].direction,
						'numberOfTurns': weavingInstructions[i][j].numberOfTurns,
						'totalTurns': i === 0
							? 0
							: picks[i - 1][j].totalTurns,
					});
				}
			}

			break;

		default:
			break;
	}

	return picks;
});

const getPattern = pattern => pattern || {};

export const getWeavingInstructionsForTablet = (pattern, tabletIndex) => {
	const { numberOfRows, 'patternDesign': { weavingInstructions } } = pattern;

	//const numberOfRows = weavingInstructions.length;
	const weavingInstructionsForTablet = [];

	for (let i = 0; i < numberOfRows; i += 1) {
		weavingInstructionsForTablet[i] = weavingInstructions[i][tabletIndex];
	}

	return weavingInstructionsForTablet;
};

const getPicksForTablet = createSelector(
	[getWeavingInstructionsForTablet],
	(weavingInstructionsForTablet) => {
		const numberOfRows = weavingInstructionsForTablet.length;
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

// TODO may be more efficient to store numberOfRows, numberOfTablets, as fixed properties so as not to recalculate on array change

export const selectorTest = (pattern) => {
	// weave by tablet instead of by row
	console.log('pattern', pattern);
	if (!pattern.patternDesign) {
		return;
	}
	const { numberOfTablets, 'patternDesign': { weavingInstructions } } = pattern;

	// const numberOfRows = weavingInstructions.length;
	//const numberOfTablets = weavingInstructions[0].length;
	const picksByTablet = [];

	for (let j = 0; j < numberOfTablets; j += 1) {
		const picksForTablet = getPicksForTablet(pattern, j);
		picksByTablet.push(picksForTablet);
	}

	return picksByTablet;
	return getPicksFromPattern(pattern);
};

/* export const selectorTest = createSelector(
	[getPattern],
	(pattern) => {
		// weave by tablet instead of by row
		const { 'patternDesign': { weavingInstructions } } = pattern;

		const numberOfRows = weavingInstructions.length;
		const numberOfTablets = weavingInstructions[0].length;


		for (let j = 0; j < numberOfTablets; j += 1) {
			const weavingInstructionsForTablet = [];
			for (let i = 0; i < numberOfRows; i += 1) {
				weavingInstructionsForTablet[j] = weavingInstructions[i][j];
			}
		}
		return getPicksFromPattern(pattern);
	},
); */
