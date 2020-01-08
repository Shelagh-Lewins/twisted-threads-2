import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';

import {
	getHoles,
	getNumberOfRows,
	getOrientationForTablet,
	getPalette,
	getPicksForTablet,
	getThreadingForTabletCached,
} from '../modules/pattern';

function PreviewCell(props) {
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
	} = props;

	console.log('render previewCell', props);

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

PreviewCell.propTypes = {
	'currentRepeat': PropTypes.number.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfRepeats': PropTypes.number.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
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
		'numberOfRows': getNumberOfRows(state),
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'picksForTablet': getPicksForTablet(state, tabletIndex),
		'threadingForTablet': getThreadingForTabletCached(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(PreviewCell);
