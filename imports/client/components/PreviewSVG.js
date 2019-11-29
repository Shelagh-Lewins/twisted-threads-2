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
import { EMPTY_HOLE_COLOR } from '../../modules/parameters';

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
// TO DO stroke color as variable
	let svg;
	console.log('numberOfTurns', numberOfTurns);
	console.log('rowIndex', rowIndex);
	console.log('tabletIndex', tabletIndex);

	// console.log('TO DO figure out row 1 when idle, 2 or 3 turns');
	if (numberOfTurns === 1) {
		if (direction === 'F') {
			svg = (
				<PathForwardWarp
					fill={threadColor}
					stroke="#444"
				/>
			);
		} else {
			svg = (
				<PathBackwardWarp
					fill={threadColor}
					stroke="#444"
				/>
			);
		}
		if (rowIndex !== 0) { // there is a previous row
			let reversal = false;
			const previousDirection = picksByTablet[tabletIndex][rowIndex - 1].direction;
			console.log('direction', direction);
			console.log('previous pick', picksByTablet[tabletIndex][rowIndex - 1]);
			if (direction !== previousDirection) {
				reversal = true;
			}

			if (reversal) {
				console.log('reversal');
				if (direction === 'F') {
					svg = (
						<PathTriangleLeft
							fill={threadColor}
							stroke="#444"
						/>
					);
				} else {
					svg = (
						<PathTriangleRight
							fill={threadColor}
							stroke="#444"
						/>
					);
				}
			}
		}
	}
	// console.log('svg', svg);
	return svg;

	// choose the svg path to represent this pick on the weaving chart
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

PreviewSVG.propTypes = {
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};
