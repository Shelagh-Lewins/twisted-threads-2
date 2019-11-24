// functions used to calculate weaving chart from pattern design

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

export const getPicksFromPatternDesign = (({ patternDesign, patternType }) => {
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
					picks[i][j] = {
						'direction': weavingInstructions[i][j].direction,
						'numberOfTurns': weavingInstructions[i][j].numberOfTurns,
					};

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
