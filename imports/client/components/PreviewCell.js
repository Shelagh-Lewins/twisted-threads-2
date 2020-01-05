import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';

import {
	getHoles,
	getOrientationForTablet,
	getPalette,
	getPicksForTablet,
	getThreadingForTablet,
} from '../modules/pattern';

class PreviewCell extends PureComponent {
	render() {
		const {
			currentRepeat,
			holes,
			numberOfRepeats,
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

PreviewCell.propTypes = {
	'currentRepeat': PropTypes.number.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfRepeats': PropTypes.number.isRequired,
	'orientation': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patternWillRepeat': PropTypes.bool.isRequired,
	'picksForTablet': PropTypes.arrayOf(PropTypes.any),
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
	'threadingForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		'holes': getHoles(state),
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'picksForTablet': getPicksForTablet(state, tabletIndex),
		'threadingForTablet': getThreadingForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(PreviewCell);
