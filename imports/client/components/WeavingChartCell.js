import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
	getOrientationForTablet,
	getPick,
	getThreadingForTablet,
	makeGetPick,
	makeUniqueSelectorInstance,
	getPickCached,
} from '../modules/pattern';
import {
	modulus,
} from '../modules/weavingUtils';

class WeavingChartCell extends PureComponent {
	render() {
		console.log('render');
		const {
			direction,
			holes,
			numberOfTurns,
			orientation,
			palette,
			pick,
			tabletIndex,
			threadingForTablet,
			totalTurns,
		} = this.props;

		// const { direction, numberOfTurns, totalTurns } = pick;

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
	const pick = getPickCached(state, `${tabletIndex}_${rowIndex}`);
console.log('WeavingChartCell', `${tabletIndex}_${rowIndex}`);

	return {
		'direction': pick.direction,
		'numberOfTurns': pick.numberOfTurns,
		'orientation': getOrientationForTablet(state, tabletIndex),
		'pick': pick,
		// 'pick': getPick(state, rowIndex, tabletIndex),
		'threadingForTablet': getThreadingForTablet(state, tabletIndex),
		'totalTurns': pick.totalTurns,
	};
}

export default connect(mapStateToProps)(WeavingChartCell);
