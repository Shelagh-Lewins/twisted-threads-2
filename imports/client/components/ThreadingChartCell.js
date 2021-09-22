import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
	getHoles,
	getOrientationForTablet,
	getPalette,
	getThreadingForHole,
} from '../modules/pattern';

function ThreadingChartCell(props) {
	const {
		holes,
		orientation,
		palette,
		rowIndex,
		tabletIndex,
		threadingForHole,
	} = props;

	const holeToShow = rowIndex;
	const colorIndex = threadingForHole;

	// threading chart is always single turns forwards from home position
	// so we don't need to pass the entire threading for the tablet, only the thread for this hole
	// this means only the changed hole re-renders when the colour changes, not all four holes
	const threadDetails = {
		'colorIndex': colorIndex,
		'holeToShow': holeToShow,
		'threadAngle': orientation === '\\' ? '\\' : '/',
		'threadColor': palette[colorIndex],
	};

	return (
		<ChartSVG
			direction="F"
			holes={holes}
			netTurns={holes - rowIndex /* hole labels run bottom to top, indexes run top to bottom */}
			numberOfTurns={1}
			orientation={orientation}
			palette={palette}
			tabletIndex={tabletIndex}
			threadDetails={threadDetails}

		/>
	);
}

ThreadingChartCell.propTypes = {
	'orientation': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'selectedRow': PropTypes.number, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForHole': PropTypes.number.isRequired,
	// 'threadingForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	const { rowIndex, selectedRow, tabletIndex } = ownProps;

	return {
		'holes': getHoles(state),
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'threadingForHole': getThreadingForHole({
			'holeIndex': rowIndex,
			selectedRow,
			state,
			tabletIndex,
		}),
	};
}

export default connect(mapStateToProps)(ThreadingChartCell);
