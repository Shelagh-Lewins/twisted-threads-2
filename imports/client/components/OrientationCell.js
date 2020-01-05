import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
	getOrientationForTablet,
} from '../modules/pattern';

// the orientation cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class OrientationCell extends PureComponent {
	render() {
		const {
			handleClickOrientation,
			isEditing,
			orientation,
			tabletIndex,
		} = this.props;

		return (
			<span
				type={isEditing ? 'button' : undefined}
				onClick={isEditing ? () => handleClickOrientation(tabletIndex) : undefined}
				onKeyPress={isEditing ? () => handleClickOrientation(tabletIndex) : undefined}
				role={isEditing ? 'button' : undefined}
				tabIndex={isEditing ? '0' : undefined}
				title={`${orientation === '/' ? 'Orientation S' : 'Orientation Z'}`}
			>
				<span
					className={`${orientation === '/' ? 's' : 'z'}`}
				/>
			</span>
		);
	}
}

OrientationCell.propTypes = {
	'handleClickOrientation': PropTypes.func.isRequired,
	'isEditing': PropTypes.bool.isRequired,
	'orientation': PropTypes.string.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		'orientation': getOrientationForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(OrientationCell);
