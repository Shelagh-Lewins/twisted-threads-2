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

export default function FreehandPreviewSVG({
	freehandChart,
	orientation,
	palette,
	rowIndex,
	tabletIndex,
}) {
	let svg;
	const borderColor = '#444';
	const cell = freehandChart[rowIndex][tabletIndex];
	const { direction, threadColor, threadShape } = cell;
	const colorValue = palette[threadColor];

	let threadAngle = '/'; // which way does the thread twist?

	if (direction === 'F') {
		if (orientation === '\\') {
			threadAngle = '\\';
		}
	} else if (orientation === '/') {
		threadAngle = '\\';
	}

	switch (threadShape) {
		case 'forwardWarp':
		case 'backwardWarp':
			svg = threadAngle === '\\'
				? <PathBackwardWarp fill={colorValue} stroke={borderColor}	/>
				: <PathForwardWarp fill={colorValue} stroke={borderColor}	/>;
			break;

		default:
			svg = <PathForwardWarp fill={colorValue} stroke={borderColor}	/>;
			break;
	}


	return svg;
}

FreehandPreviewSVG.propTypes = {
	'orientation': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};
