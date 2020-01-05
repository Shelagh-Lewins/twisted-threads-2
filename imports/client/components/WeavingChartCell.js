import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
	getHoles,
	getOrientationForTablet,
	getPalette,
	getPick,
	getThreadingForTablet,
} from '../modules/pattern';
import {
	modulus,
} from '../modules/weavingUtils';

class WeavingChartCell extends PureComponent {
	render() {
		const {
			holes,
			orientation,
			palette,
			pick,
			tabletIndex,
			threadingForTablet,
		} = this.props;
//console.log('threading', threading);
		const { direction, numberOfTurns, totalTurns } = pick;

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
}

WeavingChartCell.propTypes = {
	'orientation': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'pick': PropTypes.objectOf(PropTypes.any),
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	const { rowIndex, tabletIndex } = ownProps;
//console.log('WeavingChartCell mapStateToProps rowIndex', rowIndex);
//console.log('tabletIndex', tabletIndex);
	return {
		'holes': getHoles(state),
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'pick': getPick(state, rowIndex, tabletIndex),
		'threadingForTablet': getThreadingForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(WeavingChartCell);
