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
		threadingForTablet,
	} = props;
	
	let svg = null;

	const {
		colorIndex,
		holeToShow,
		threadAngle,
		threadColor,
	} = getThread({
		direction,
		EMPTY_HOLE_COLOR,
		holes,
		netTurns,
		orientation,
		palette,
		threadingForTablet,
	});

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

ChartSVG.propTypes = {
	'direction': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'netTurns': PropTypes.number.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'orientation': PropTypes.string.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};
