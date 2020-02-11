import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';

import {
	getIsEditing,
	getHoles,
	//getNumberOfRows,
	getOrientationForTablet,
	getPalette,
	//getPicksForTablet,
	getPicksForTabletForChart,
	getThreadingForTablet,
} from '../modules/pattern';

class PreviewCell extends Component {
	shouldComponentUpdate(nextProps, nextState) {
		const { componentShouldUpdate } = nextProps;

		return componentShouldUpdate;
	}

	render() {
		const {
			currentRepeat,
			holes,
			numberOfRepeats,
			numberOfRows,
			orientation,
			palette,
			patternWillRepeat,
			picksForTablet,
			rowIndex,
			tabletIndex,
			threadingForTablet,
		} = this.props;

		return (
			<PreviewSVG
				currentRepeat={currentRepeat}
				holes={holes}
				numberOfRepeats={numberOfRepeats}
				numberOfRows={numberOfRows}
				orientation={orientation}
				palette={palette}
				patternWillRepeat={patternWillRepeat}
				picksForTablet={picksForTablet}
				rowIndex={rowIndex}
				tabletIndex={tabletIndex}
				threadingForTablet={threadingForTablet}
			/>
		);
	}
}

// some props are briefly unavailable after a row or tablet has been deleted
PreviewCell.propTypes = {
	'componentShouldUpdate': PropTypes.bool.isRequired,
	'currentRepeat': PropTypes.number.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfRepeats': PropTypes.number.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'orientation': PropTypes.string,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patternWillRepeat': PropTypes.bool.isRequired,
	'picksForTablet': PropTypes.arrayOf(PropTypes.any),
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.arrayOf(PropTypes.any),
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		'componentShouldUpdate': !getIsEditing(state),
		'holes': getHoles(state),
		//'numberOfRows': getNumberOfRows(state),
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'picksForTablet': getPicksForTabletForChart(state, tabletIndex),
		// 'picksForTablet': getPicksForTablet(state, tabletIndex),
		'threadingForTablet': getThreadingForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(PreviewCell);
