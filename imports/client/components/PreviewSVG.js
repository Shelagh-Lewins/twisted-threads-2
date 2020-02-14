// return the correct SVG for a pick in the pattern preview

import React from 'react';
import PropTypes from 'prop-types';
import {
	PathBackwardWarp,
	PathBackwardWarp2,
	PathBackwardWarp3,
	PathForwardWarp,
	PathForwardWarp2,
	PathForwardWarp3,
	PathTriangleLeft,
	PathTriangleLeft2,
	PathTriangleLeft3,
	PathTriangleRight,
	PathTriangleRight2,
	PathTriangleRight3,
} from '../modules/previewPaths';
import {
	getPrevColor,
	getThread,
	modulus,
} from '../modules/weavingUtils';

export default function PreviewSVG({
	holes,
	numberOfRows,
	orientation,
	palette,
	patternWillRepeat,
	picksForTablet,
	rowIndex,
	tabletIndex,
	threadingForTablet,
}) {
	// picksByTablet are calculated after the pattern data has loaded so can be blank
	if (!picksForTablet) {
		return;
	}

	const { direction, numberOfTurns, totalTurns } = picksForTablet[rowIndex];

	const netTurns = modulus(totalTurns, holes);
	const emptyHoleColor = 'transparent'; // transparent to show weft
	const borderColor = '#444';

	let reversal = false;

	// check for reversal
	let previousPick;

	if (rowIndex !== 0) {
		// there is a previous row
		previousPick = picksForTablet[rowIndex - 1];
	} else if (patternWillRepeat) {
		previousPick = picksForTablet[numberOfRows - 1];
	}

	if (previousPick && direction !== previousPick.direction) {
		reversal = true;
	}

	const {
		holeToShow,
		threadAngle,
		threadColor,
	} = getThread({
		direction,
		emptyHoleColor,
		holes,
		netTurns,
		orientation,
		palette,
		threadingForTablet,
	});

	let svg;

	// idle or single turn, just show current thread
	if (numberOfTurns === 0 || numberOfTurns === 1) {
		svg = threadAngle === '\\'
			? <PathBackwardWarp fill={threadColor} stroke={borderColor}	/>
			: <PathForwardWarp fill={threadColor} stroke={borderColor}	/>;

		if (reversal) {
			svg = threadAngle === '\\'
				? <PathTriangleRight fill={threadColor} stroke={borderColor}	/>
				: <PathTriangleLeft fill={threadColor} stroke={borderColor}	/>;
		}
	} else if (numberOfTurns === 2) {
		const prevThreadColor1 = getPrevColor({
			'direction': direction,
			holes,
			holeToShow,
			'offset': 1,
			palette,
			tabletIndex,
			threadingForTablet,
		});
		svg = threadAngle === '\\'
			? <PathBackwardWarp2 fill1={prevThreadColor1} fill2={threadColor} stroke={borderColor}	/>
			: <PathForwardWarp2 fill1={prevThreadColor1} fill2={threadColor} stroke={borderColor}	/>;

		if (reversal) {
			svg = threadAngle === '\\'
				? <PathTriangleRight2 fill1={prevThreadColor1} fill2={threadColor} stroke={borderColor}	/>
				: <PathTriangleLeft2 fill1={prevThreadColor1} fill2={threadColor} stroke={borderColor}	/>;
		}
	} else if (numberOfTurns === 3) {
		const prevThreadColor1 = getPrevColor({
			'direction': direction,
			holes,
			holeToShow,
			'offset': 1,
			palette,
			tabletIndex,
			threadingForTablet,
		});
		const prevThreadColor2 = getPrevColor({
			'direction': direction,
			holes,
			holeToShow,
			'offset': 2,
			palette,
			tabletIndex,
			threadingForTablet,
		});

		svg = threadAngle === '\\'
			? <PathBackwardWarp3 fill1={prevThreadColor2} fill2={prevThreadColor1} fill3={threadColor} stroke={borderColor}	/>
			: <PathForwardWarp3 fill1={prevThreadColor2} fill2={prevThreadColor1} fill3={threadColor} stroke={borderColor}	/>;

		if (reversal) {
			svg = threadAngle === '\\'
				? <PathTriangleRight3 fill1={prevThreadColor2} fill2={prevThreadColor1} fill3={threadColor} stroke={borderColor}	/>
				: <PathTriangleLeft3 fill1={prevThreadColor2} fill2={prevThreadColor1} fill3={threadColor} stroke={borderColor}	/>;
		}
	}

	return svg;
}

PreviewSVG.propTypes = {
	'currentRepeat': PropTypes.number.isRequired,
	'numberOfRepeats': PropTypes.number.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'patternWillRepeat': PropTypes.bool.isRequired,
	'picksForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};
