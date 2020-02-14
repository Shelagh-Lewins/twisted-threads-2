import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FreehandPreviewSVG from './FreehandPreviewSVG';

import {
	getOrientationForTablet,
	getPreviewShouldUpdate,
	getPalette,
	getPatternDesign,
} from '../modules/pattern';

class FreehandPreviewCell extends Component {
	shouldComponentUpdate(nextProps) {
		const { componentShouldUpdate } = nextProps;

		return componentShouldUpdate;
	}

	render() {
		const {
			orientation,
			palette,
			'patternDesign': { freehandChart },
			rowIndex,
			tabletIndex,
		} = this.props;

		return (
			<FreehandPreviewSVG
				freehandChart={freehandChart}
				orientation={orientation}
				palette={palette}
				rowIndex={rowIndex}
				tabletIndex={tabletIndex}
			/>
		);
	}
}

// some props are briefly unavailable after a row or tablet has been deleted
FreehandPreviewCell.propTypes = {
	'componentShouldUpdate': PropTypes.bool.isRequired,
	'orientation': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		'componentShouldUpdate': getPreviewShouldUpdate(state),
		'orientation': getOrientationForTablet(state, tabletIndex),
		'palette': getPalette(state),
		'patternDesign': getPatternDesign(state),
	};
}

export default connect(mapStateToProps)(FreehandPreviewCell);
