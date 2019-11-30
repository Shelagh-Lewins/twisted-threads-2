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
	PathTriangleRight2,
	PathTriangleRight,
	PathVerticalCenterWarp,
	PathVerticalLeftWarp,
	PathVerticalRightWarp,
} from '../modules/previewPaths';
import {
	findPrevColor,
	isValidColorIndex,
	modulus,
} from '../modules/weavingUtils';

export default function PreviewSVG({
	pattern,
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
		orientations,
		palette,
		threading,
	} = pattern;
	const { direction, numberOfTurns, totalTurns } = picksByTablet[tabletIndex][rowIndex];
	const netTurns = modulus(totalTurns, holes);
	const orientation = orientations[tabletIndex];
	const emptyHoleColor = 'transparent'; // transparent to show weft
	const borderColor = '#444';

	let holeToShow;
	let adjustedDirection = direction; // use previous pick if idle
	let reversal = false;

	// check for idling and reversal
	if (rowIndex !== 0) { // there is a previous row
		const previousPick = picksByTablet[tabletIndex][rowIndex - 1];

		if (numberOfTurns === 0) { // idle tablet, use previous row to judge which thread to show
			adjustedDirection = previousPick.direction;
		} else if (direction !== previousPick.direction && previousPick.numberOfTurns !== 0) {
			// the tablet hasn't idled
			reversal = true;
		}
	}

	if (adjustedDirection === 'F') {
		// show thread in position A
		holeToShow = modulus(holes - netTurns, holes);
	} else {
		// show thread in position D
		holeToShow = modulus(holes - netTurns - 1, holes);
	}

	const colorIndex = threading[holeToShow][tabletIndex];

	if (!isValidColorIndex(colorIndex)) {
		return null;
	}

	let threadColor = emptyHoleColor;
	if (colorIndex !== -1) { // not empty, there is a thread
		threadColor = palette[colorIndex];
	}

	let threadAngle = '/'; // which way does the thread twist?

	if (adjustedDirection === 'F') {
		if (orientation === '\\') {
			threadAngle = '\\';
		}
	} else if (orientation === '/') {
		threadAngle = '\\';
	}

// TO DO stroke color as variable
	let svg;
	//console.log('numberOfTurns', numberOfTurns);
	//console.log('rowIndex', rowIndex);
	//console.log('tabletIndex', tabletIndex);

	if (numberOfTurns === 0) {
		console.log('idle');
		console.log('threadColor', threadColor);
	}

	// TO DO ORIENTATION
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
		svg = threadAngle === '\\'
			? <PathBackwardWarp2 fill={threadColor} stroke={borderColor}	/>
			: <PathForwardWarp2 fill={threadColor} stroke={borderColor}	/>;

		if (reversal) {
			svg = threadAngle === '\\'
				? <PathTriangleRight2 fill={threadColor} stroke={borderColor}	/>
				: <PathTriangleLeft2 fill={threadColor} stroke={borderColor}	/>;
		}
	}
	// console.log('svg', svg);
	return svg;
}

PreviewSVG.propTypes = {
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};
