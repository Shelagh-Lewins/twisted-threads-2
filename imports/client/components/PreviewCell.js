import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';

import {
	getPreviewShouldUpdate,
	getHoles,
	getOrientationForTablet,
	getPalette,
	getPicksForTabletForChart,
	getThreadingForTablet,
} from '../modules/pattern';

class PreviewCell extends Component {
	shouldComponentUpdate(nextProps) {
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
			showBackOfBand,
			tabletIndex,
			threadingForTablet,
		} = this.props;

		if (!orientation) {
			return null;
		}

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
				showBackOfBand={showBackOfBand}
				tabletIndex={tabletIndex}
				threadingForTablet={threadingForTablet}
			/>
		);
	}
}

// some props are briefly unavailable after a row or tablet has been deleted
PreviewCell.propTypes = {
	componentShouldUpdate: PropTypes.bool.isRequired,
	currentRepeat: PropTypes.number.isRequired,
	holes: PropTypes.number.isRequired,
	numberOfRepeats: PropTypes.number.isRequired,
	numberOfRows: PropTypes.number.isRequired,
	orientation: PropTypes.string, // can be temporarily missing after remove last tablet
	palette: PropTypes.arrayOf(PropTypes.any).isRequired,
	patternWillRepeat: PropTypes.bool.isRequired,
	picksForTablet: PropTypes.arrayOf(PropTypes.any),
	rowIndex: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	showBackOfBand: PropTypes.bool,
	tabletIndex: PropTypes.number.isRequired,
	threadingForTablet: PropTypes.arrayOf(PropTypes.any),
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		componentShouldUpdate: getPreviewShouldUpdate(state),
		holes: getHoles(state),
		orientation: getOrientationForTablet(state, tabletIndex),
		palette: getPalette(state),
		picksForTablet: getPicksForTabletForChart(state, tabletIndex),
		threadingForTablet: getThreadingForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(PreviewCell);
