import React from 'react';
import PropTypes from 'prop-types';
import {
	SVGBackwardEmpty,
	SVGForwardEmpty,
	SVGBackwardWarp,
	SVGBackwardWarp2,
	SVGBackwardWarp3,
	SVGForwardWarp,
	SVGForwardWarp2,
	SVGForwardWarp3,
	SVGIdle,
} from '../modules/svg';
import { isValidColorIndex, modulus } from '../modules/weavingUtils';

export default function ChartSVG({
	direction,
	netTurns,
	numberOfTurns,
	orientation,
	pattern,
	tabletIndex,
}) {
	const { holes, palette, threading } = pattern;
	let svg = null;
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

	let threadAngle = '/'; // which way does the thread twist?
	if (direction === 'F') {
		if (orientation === '\\') {
			threadAngle = '\\';
		}
	} else if (orientation === '/') {
		threadAngle = '\\';
	}

	// choose the svg graphic to represent this pick on the weaving chart
	if (numberOfTurns === 0) {
		svg = <SVGIdle />;
	} else if (numberOfTurns === 1) {
		svg = threadAngle === '\\'
			? (
				<SVGBackwardWarp
					fill={palette[colorIndex]}
					stroke="#000000"
				/>
			)
			: (
				<SVGForwardWarp
					fill={palette[colorIndex]}
					stroke="#000000"
				/>
			);
	} else if (numberOfTurns === 2) {
		svg = threadAngle === '\\'
			? (
				<SVGBackwardWarp2
					stroke={palette[threading[modulus(holeToShow - 1, holes)][tabletIndex]]}
					fill={palette[colorIndex]}

				/>
			)
			: (
				<SVGForwardWarp2
					fill={palette[colorIndex]}
					stroke={palette[threading[modulus(holeToShow + 1, holes)][tabletIndex]]}
				/>
			);
	} else if (numberOfTurns === 3) {
		svg = threadAngle === '\\'
			? (
				<SVGBackwardWarp3
					stroke={palette[threading[modulus(holeToShow - 1, holes)][tabletIndex]]}
					fill={palette[colorIndex]}

				/>
			)
			: (
				<SVGForwardWarp3
					fill={palette[colorIndex]}
					stroke={palette[threading[modulus(holeToShow + 1, holes)][tabletIndex]]}
				/>
			);
	} else if (colorIndex === -1) { // empty hole
		svg = threadAngle === '\\'
			? (
				<SVGBackwardEmpty />
			)
			: (
				<SVGForwardEmpty	/>
			);
	}

	return svg;
}

ChartSVG.propTypes = {
	'direction': PropTypes.string.isRequired,
	'netTurns': PropTypes.number.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'orientation': PropTypes.string.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};
