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
		palette,
		patternDesign,
		rowIndex,
		tabletIndex,
	} = props;

	const chartCell = patternDesign.freehandChart[rowIndex][tabletIndex];

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
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};

function mapStateToProps(state) {
	return {
		'palette': getPalette(state),
		'patternDesign': getPatternDesign(state),
	};
}

export default connect(mapStateToProps)(FreehandChartCell);
