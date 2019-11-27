import React from 'react';
import PropTypes from 'prop-types';
import {
	SVGBackward2,
	SVGBackwardEmpty,
	SVGBackwardWarp,
	SVGForward2,
	SVGForwardEmpty,
	SVGForwardWarp,
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
	let svg;
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
		return;
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
	} else if (numberOfTurns === 2) {
		svg = threadAngle === '\\'
			? (
				<SVGBackward2 />
			)
			: (
				<SVGForward2	/>
			);
	} else if (colorIndex === -1) { // empty hole
		svg = threadAngle === '\\'
			? (
				<SVGBackwardEmpty />
			)
			: (
				<SVGForwardEmpty	/>
			);
	} else { // colored thread
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
