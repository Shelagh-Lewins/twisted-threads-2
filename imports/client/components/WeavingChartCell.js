import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
	getHoles,
	getOrientationForTablet,
	getPalette,
	getPick,
	getPickForChart,
	getThreadingForTablet,
} from '../modules/pattern';
import {
	modulus,
} from '../modules/weavingUtils';

function WeavingChartCell(props) {
	const {
		direction,
		holes,
		numberOfTurns,
		orientation,
		palette,
		tabletIndex,
		threadingForTablet,
		totalTurns,
	} = props;

	const netTurns = modulus(totalTurns, holes);

	// if not idle, show direction
	let directionClass = '';
	if (numberOfTurns !== 0) {
		if (direction === 'F') {
			directionClass = 'forward';
		} else if (direction === 'B') {
			directionClass = 'backward';
		}
	}

	return (
		<span
			className={directionClass}
		>
			<ChartSVG
				direction={direction}
				holes={holes}
				netTurns={netTurns}
				numberOfTurns={numberOfTurns}
				orientation={orientation}
				palette={palette}
				tabletIndex={tabletIndex}
				threadingForTablet={threadingForTablet}
			/>
		</span>
	);
}

WeavingChartCell.propTypes = {
	'direction': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'orientation': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'totalTurns': PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex, rowIndex } = ownProps;

	const { direction, numberOfTurns, totalTurns } = getPickForChart(state, tabletIndex, rowIndex);
	// const { direction, numberOfTurns, totalTurns } = getPick(state, tabletIndex, rowIndex);

	return {
		'direction': direction,
		'holes': getHoles(state),
		'numberOfTurns': numberOfTurns,
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'threadingForTablet': getThreadingForTablet(state, tabletIndex),
		'totalTurns': totalTurns,
	};
}

export default connect(mapStateToProps)(WeavingChartCell);
