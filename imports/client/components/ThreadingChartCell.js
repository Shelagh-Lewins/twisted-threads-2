import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
	getOrientationForTablet,
	getPick,
	getThreadingForTablet,
} from '../modules/pattern';

class ThreadingChartCell extends PureComponent {
	render() {
		const {
			holes,
			orientation,
			palette,
			rowIndex,
			tabletIndex,
			threadingForTablet,
		} = this.props;

		return (
			<ChartSVG
				direction="F"
				holes={holes}
				netTurns={holes - rowIndex /* hole labels run bottom to top, indexes run top to bottom */}
				numberOfTurns={1}
				orientation={orientation}
				palette={palette}
				tabletIndex={tabletIndex}
				threadingForTablet={JSON.parse(threadingForTablet)}
			/>
		);
	}
}

ThreadingChartCell.propTypes = {
	'orientation': PropTypes.string.isRequired,
	'holes': PropTypes.number.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { rowIndex, tabletIndex } = ownProps;

	return {
		'orientation': getOrientationForTablet(state, tabletIndex),
		'pick': getPick(state, rowIndex, tabletIndex),
		'threadingForTablet': getThreadingForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(ThreadingChartCell);
