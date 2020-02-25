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
	const emptyHoleColor = 'transparent'; // transparent to show weft
	const defaultColor = '#fff'; // used when multiple turns and we don't know the previous colours
	const cell = freehandChart[rowIndex][tabletIndex];
	const { direction, threadColor, threadShape } = cell;
	const colorValue = palette[threadColor];
	let previousColor = defaultColor;

	// check for reversal
	let reversal = false;
	let previousCell;

	if (rowIndex !== 0) {
		// there is a previous row
		previousCell = freehandChart[rowIndex - 1][tabletIndex];
		previousColor = palette[previousCell.threadColor];
	} else if (freehandChart[rowIndex + 1]) { // try next colour instead
		previousCell = freehandChart[rowIndex + 1][tabletIndex];
		previousColor = palette[previousCell.threadColor];
	}

	if (previousCell && direction !== previousCell.direction) {
		reversal = true;
	}

	let threadAngle = '/'; // which way does the thread twist?

	if (direction === 'F') {
		if (orientation === '\\') {
			threadAngle = '\\';
		}
	} else if (orientation === '/') {
		threadAngle = '\\';
	}

	switch (threadShape) {
		case 'idle':
			svg = threadAngle === '\\'
				? <PathBackwardWarp fill={previousColor} stroke={borderColor}	/>
				: <PathForwardWarp fill={previousColor} stroke={borderColor}	/>;
			break;

		case 'forwardEmpty':
		case 'backwardEmpty':
			svg = threadAngle === '\\'
				? <PathBackwardWarp fill={emptyHoleColor} stroke={borderColor}	/>
				: <PathForwardWarp fill={emptyHoleColor} stroke={borderColor}	/>;

			if (reversal) {
				svg = threadAngle === '\\'
					? <PathTriangleRight fill={emptyHoleColor} stroke={borderColor}	/>
					: <PathTriangleLeft fill={emptyHoleColor} stroke={borderColor}	/>;
			}
			break;

		case 'forwardWarp':
		case 'backwardWarp':
			svg = threadAngle === '\\'
				? <PathBackwardWarp fill={colorValue} stroke={borderColor}	/>
				: <PathForwardWarp fill={colorValue} stroke={borderColor}	/>;

			if (reversal) {
				svg = threadAngle === '\\'
					? <PathTriangleRight fill={colorValue} stroke={borderColor}	/>
					: <PathTriangleLeft fill={colorValue} stroke={borderColor}	/>;
			}

			break;

		case 'forwardWarp2':
		case 'backwardWarp2':
			svg = threadAngle === '\\'
				? <PathBackwardWarp2 fill1={defaultColor} fill2={colorValue} stroke={borderColor}	/>
				: <PathForwardWarp2 fill1={defaultColor} fill2={colorValue} stroke={borderColor}	/>;

			if (reversal) {
				svg = threadAngle === '\\'
					? <PathTriangleRight2 fill1={colorValue} fill2={defaultColor} stroke={borderColor}	/>
					: <PathTriangleLeft2 fill1={colorValue} fill2={defaultColor} stroke={borderColor}	/>;
			}

			break;

		case 'forwardWarp3':
		case 'backwardWarp3':
			svg = threadAngle === '\\'
				? <PathBackwardWarp3 fill1={defaultColor} fill2={defaultColor} fill3={colorValue} stroke={borderColor}	/>
				: <PathForwardWarp3 fill1={defaultColor} fill2={defaultColor} fill3={colorValue} stroke={borderColor}	/>;

			if (reversal) {
				svg = threadAngle === '\\'
					? <PathTriangleRight3 fill1={colorValue} fill2={colorValue} fill3={defaultColor} stroke={borderColor}	/>
					: <PathTriangleLeft3 fill1={colorValue} fill2={colorValue} fill3={defaultColor} stroke={borderColor}	/>;
			}

			break;

		case 'block':
			svg = <PathBlock fill={colorValue} stroke={borderColor}	/>;
			break;

		case 'verticalLeftWarp':
			svg = <PathVerticalLeftWarp fill={colorValue} stroke={borderColor}	/>;
			break;

		case 'verticalCenterWarp':
			svg = <PathVerticalCenterWarp fill={colorValue} stroke={borderColor}	/>;
			break;

		case 'verticalRightWarp':
			svg = <PathVerticalRightWarp fill={colorValue} stroke={borderColor}	/>;
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
