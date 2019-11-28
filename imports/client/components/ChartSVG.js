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
import {
	findPrevColor,
	isValidColorIndex,
	modulus,
} from '../modules/weavingUtils';
import { EMPTY_HOLE_COLOR } from '../../modules/parameters';

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

	let threadColor = EMPTY_HOLE_COLOR;
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

	// choose the svg graphic to represent this pick on the weaving chart
	if (numberOfTurns === 0) {
		svg = <SVGIdle />;
	} else if (numberOfTurns === 1) {
		if (colorIndex === -1) { // empty hole
			svg = threadAngle === '\\'
				? (
					<SVGBackwardEmpty />
				)
				: (
					<SVGForwardEmpty	/>
				);
		} else {
			svg = threadAngle === '\\'
				? (
					<SVGBackwardWarp
						fill={threadColor}
						stroke="#000000"
					/>
				)
				: (
					<SVGForwardWarp
						fill={threadColor}
						stroke="#000000"
					/>
				);
		}
	} else if (numberOfTurns === 2) {
		const prevThreadColor1 = findPrevColor({
			direction,
			holes,
			holeToShow,
			'offset': 1,
			palette,
			tabletIndex,
			threading,
		});

		svg = threadAngle === '\\'
			? (
				<SVGBackwardWarp2
					fill={threadColor}
					stroke={prevThreadColor1}
				/>
			)
			: (
				<SVGForwardWarp2
					fill={threadColor}
					stroke={prevThreadColor1}
				/>
			);
	} else if (numberOfTurns === 3) {
		const prevThreadColor1 = findPrevColor({
			direction,
			holes,
			holeToShow,
			'offset': 1,
			palette,
			tabletIndex,
			threading,
		});
		const prevThreadColor2 = findPrevColor({
			direction,
			holes,
			holeToShow,
			'offset': 2,
			palette,
			tabletIndex,
			threading,
		});

		svg = threadAngle === '\\'
			? (
				<SVGBackwardWarp3
					fill={threadColor}
					stroke1={prevThreadColor1}
					stroke2={prevThreadColor2}
				/>
			)
			: (
				<SVGForwardWarp3
					fill={threadColor}
					stroke1={prevThreadColor1}
					stroke2={prevThreadColor2}
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
