import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FreehandPreviewSVG from './FreehandPreviewSVG';

import {
	getPreviewShouldUpdate,
	getHoles,
	getOrientationForTablet,
	getPalette,
	getPicksForTabletForChart,
	getThreadingForTablet,
} from '../modules/pattern';

class FreehandPreviewCell extends Component {
	shouldComponentUpdate(nextProps) {
		const { componentShouldUpdate } = nextProps;

		return componentShouldUpdate;
	}

	render() {
		const {
			palette,
			rowIndex,
			tabletIndex,

		} = this.props;

		return (
			<FreehandPreviewSVG
				rowIndex={rowIndex}
				tabletIndex={tabletIndex}
			/>
		);
	}
}

// some props are briefly unavailable after a row or tablet has been deleted
FreehandPreviewCell.propTypes = {
	'componentShouldUpdate': PropTypes.bool.isRequired,
	//'currentRepeat': PropTypes.number.isRequired,
	//'holes': PropTypes.number.isRequired,
	//'numberOfRepeats': PropTypes.number.isRequired,
	//'numberOfRows': PropTypes.number.isRequired,
	//'orientation': PropTypes.string,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	//'patternType': PropTypes.string.isRequired,
	//'patternWillRepeat': PropTypes.bool.isRequired,
	//'picksForTablet': PropTypes.arrayOf(PropTypes.any),
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	//'threadingForTablet': PropTypes.arrayOf(PropTypes.any),
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		'componentShouldUpdate': getPreviewShouldUpdate(state),
		//'holes': getHoles(state),
		//'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		//'picksForTablet': getPicksForTabletForChart(state, tabletIndex),
		//'threadingForTablet': getThreadingForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(FreehandPreviewCell);
