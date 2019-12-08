// return the correct SVG for a pick in the pattern preview

import React from 'react';
import PropTypes from 'prop-types';
import {
	PathBackwardWarp,
	PathBackwardWarp2,
	PathBackwardWarp3,
	PathBlock,
	PathForwardWarp,
	PathForwardWarp2,
	PathForwardWarp3,
	PathTriangleLeft,
	PathTriangleLeft2,
	PathTriangleLeft3,
	PathTriangleRight,
	PathTriangleRight2,
	PathTriangleRight3,
	PathVerticalCenterWarp,
	PathVerticalLeftWarp,
	PathVerticalRightWarp,
} from '../modules/previewPaths';
import {
	getPrevColor,
	getThread,
	modulus,
} from '../modules/weavingUtils';

export default function PreviewSVG({
	pattern,
	patternWillRepeat,
	picksByTablet,
	rowIndex,
	tabletIndex,
}) {
	// picksByTablet are calculated after the pattern data has loaded so can be blank
	if (!picksByTablet || !picksByTablet[0]) {
		return;
	}

	const {
		holes,
		numberOfRows,
		orientations,
		palette,
		threading,
	} = pattern;
	const { direction, numberOfTurns, totalTurns } = picksByTablet[tabletIndex][rowIndex];
	const netTurns = modulus(totalTurns, holes);
	const orientation = orientations[tabletIndex];
	const emptyHoleColor = 'transparent'; // transparent to show weft
	const borderColor = '#444';

	let reversal = false;

	// check for reversal
	let previousPick;

	if (rowIndex !== 0) {
		// there is a previous row
		previousPick = picksByTablet[tabletIndex][rowIndex - 1];
	} else if (patternWillRepeat) {
		previousPick = picksByTablet[tabletIndex][numberOfRows - 1];
	}

	if (previousPick && direction !== previousPick.direction) {
		reversal = true;
	}

	const {
		holeToShow,
		threadAngle,
		threadColor,
	} = getThread(
		direction,
		emptyHoleColor,
		holes,
		netTurns,
		orientation,
		palette,
		rowIndex,
		tabletIndex,
		threading,
	);

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
			threading,
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
			threading,
		});
		const prevThreadColor2 = getPrevColor({
			'direction': direction,
			holes,
			holeToShow,
			'offset': 2,
			palette,
			tabletIndex,
			threading,
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
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternWillRepeat': PropTypes.bool.isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};
