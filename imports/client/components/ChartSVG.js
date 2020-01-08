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
	getThread,
	getPrevColor,
} from '../modules/weavingUtils';
import { EMPTY_HOLE_COLOR } from '../../modules/parameters';

export default function ChartSVG(props) {
	const {
		direction,
		holes,
		netTurns,
		numberOfTurns,
		orientation,
		palette,
		tabletIndex,
		threadDetails, // used to optimise Threading chart
		threadingForTablet,
	} = props;

	let svg = null;

	let colorIndex;
	let holeToShow;
	let threadAngle;
	let threadColor;

	if (threadDetails) {
		colorIndex = threadDetails.colorIndex;
		holeToShow = threadDetails.holeToShow;
		threadAngle = threadDetails.threadAngle;
		threadColor = threadDetails.threadColor;
	} else {
		const result = getThread({
			direction,
			EMPTY_HOLE_COLOR,
			holes,
			netTurns,
			orientation,
			palette,
			threadingForTablet,
		});

		colorIndex = result.colorIndex;
		holeToShow = result.holeToShow;
		threadAngle = result.threadAngle;
		threadColor = result.threadColor;
	}

	// choose the svg graphic to represent this pick on the weaving chart
	if (numberOfTurns === 0) {
		svg = (
			<SVGIdle
				fill={threadColor}
				stroke="#000000"
			/>
		);
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
		const prevThreadColor1 = getPrevColor({
			direction,
			holes,
			holeToShow,
			'offset': 1,
			palette,
			tabletIndex,
			threadingForTablet,
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
		const prevThreadColor1 = getPrevColor({
			direction,
			holes,
			holeToShow,
			'offset': 1,
			palette,
			tabletIndex,
			threadingForTablet,
		});
		const prevThreadColor2 = getPrevColor({
			direction,
			holes,
			holeToShow,
			'offset': 2,
			palette,
			tabletIndex,
			threadingForTablet,
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

// one of threadDetails and threadingForTablet must be provided
ChartSVG.propTypes = {
	'direction': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'netTurns': PropTypes.number.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'orientation': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tabletIndex': PropTypes.number.isRequired,
	'threadDetails': PropTypes.objectOf(PropTypes.any),
	'threadingForTablet': PropTypes.arrayOf(PropTypes.any),
};
