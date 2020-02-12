import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FreehandSVG from './FreehandSVG';

import {
	getPalette,
	getPatternDesign,
} from '../modules/pattern';

function FreehandChartCell(props) {
	const {
		chartCell,
		palette,
	} = props;

	const { direction } = chartCell;

	// show direction
	let directionClass = '';

	if (direction === 'F') {
		directionClass = 'forward';
	} else if (direction === 'B') {
		directionClass = 'backward';
	}

	return (
		<span
			className={directionClass}
		>
			<FreehandSVG
				chartCell={chartCell}
				palette={palette}
			/>
		</span>
	);
}

FreehandChartCell.propTypes = {
	'chartCell': PropTypes.objectOf(PropTypes.any).isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex, rowIndex } = ownProps;

	return {
		'chartCell': getPatternDesign(state, rowIndex, tabletIndex).weavingChart[rowIndex][tabletIndex],
		'palette': getPalette(state),
	};
}

export default connect(mapStateToProps)(FreehandChartCell);
