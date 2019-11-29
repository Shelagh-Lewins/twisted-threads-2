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
	if (!picksByTablet) {
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

	if (direction === 'F') {
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

	if (direction === 'F') {
		if (orientation === '\\') {
			threadAngle = '\\';
		}
	} else if (orientation === '/') {
		threadAngle = '\\';
	}
// TO DO stroke color as variable
	let svg;
	console.log('numberOfTurns', numberOfTurns);
	console.log('rowIndex', rowIndex);
	console.log('tabletIndex', tabletIndex);
	let previousDirection;
	let previousColor1;
	let reversal = false;

	if (rowIndex !== 0) { // there is a previous row
		previousDirection = picksByTablet[tabletIndex][rowIndex - 1].direction;
		const PreviousColorIndex1 = picksByTablet[tabletIndex][rowIndex - 1].color;
		previousColor1 = emptyHoleColor;
		if (colorIndex !== -1) { // not empty, there is a thread
			previousColor1 = palette[PreviousColorIndex1];
		}

		if (direction !== previousDirection) {
			reversal = true;
		}
	}

	if (numberOfTurns === 0) { // idle
		const color = previousColor1 || threadColor;
		svg = direction === 'F'
			? <PathForwardWarp fill={color} stroke={borderColor}	/>
			: <PathBackwardWarp fill={color} stroke={borderColor}	/>;
	} else if (numberOfTurns === 1) {
		svg = direction === 'F'
			? <PathForwardWarp fill={threadColor} stroke={borderColor}	/>
			: <PathBackwardWarp fill={threadColor} stroke={borderColor}	/>;

		if (reversal) {
			svg = direction === 'F'
				? <PathTriangleLeft fill={threadColor} stroke={borderColor}	/>
				: <PathTriangleRight fill={threadColor} stroke={borderColor}	/>;
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
