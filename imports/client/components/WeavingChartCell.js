import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
	getDirection,
	getNumberOfTurns,
	getOrientationForTablet,
	getPick,
	getThreadingForTablet,
	getTotalTurns,
	makeGetPick,
	getThreadingForTabletCached,
	makeUniqueSelectorInstance,
	getPickCached,
} from '../modules/pattern';
import {
	modulus,
} from '../modules/weavingUtils';

class WeavingChartCell extends PureComponent {
	componentDidUpdate(prevProps, prevState) {
		const {tabletIndex, rowIndex} = this.props;
		//console.log('componentDidUpdate');
		//console.log('new', JSON.stringify(this.props));
		//console.log('old', JSON.stringify(prevProps));
		Object.keys(this.props).forEach((key) => {
			if (this.props[key] !== prevProps[key]) {
				console.log('change to ', key);
				console.log('old value ', prevProps[key]);
				console.log('new value ', this.props[key]);
			}
		});

		/* if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
			console.log('changed props. Tablet, row', tabletIndex, rowIndex);
			console.log('prevProps', prevProps);
			console.log('this.props', this.props);
		} */
		//console.log('changed props', JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
			//console.log('changed. Tablet, row', tabletIndex, rowIndex););

		//console.log('state');
		//console.log('new', JSON.stringify(this.state));
		//console.log('old', JSON.stringify(prevState));
		//console.log('changed state', JSON.stringify(this.state) !== JSON.stringify(prevState));

		/* if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
			console.log('changed state. Tablet, row', tabletIndex, rowIndex);
			console.log('prevProps', prevProps);
			console.log('this.props', this.props);
		} */
	}

	render() {
		const {
			direction,
			holes,
			numberOfTurns,
			orientation,
			palette,
			tabletIndex,
			threadingForTablet,
			totalTurns,
		} = this.props;

		//console.log('render', this.props);

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
					threadingForTablet={JSON.parse(threadingForTablet)}
				/>
			</span>
		);
	}
}

WeavingChartCell.propTypes = {
	'direction': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'orientation': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.string.isRequired,
	'totalTurns': PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex, rowIndex } = ownProps;
	const { direction, numberOfTurns, totalTurns } = state.pattern.picks[tabletIndex][rowIndex];

	return {
		'direction': direction,
		'numberOfTurns': numberOfTurns,
		// 'orientation': getOrientationForTablet(state, tabletIndex),
		'orientation': '/',
		'threadingForTablet': getThreadingForTabletCached(state, tabletIndex),
		'totalTurns': totalTurns,
	};
}

export default connect(mapStateToProps)(WeavingChartCell);
