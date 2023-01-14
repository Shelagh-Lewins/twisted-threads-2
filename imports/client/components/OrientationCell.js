import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getOrientationForTablet } from '../modules/pattern';

// the orientation cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

function OrientationCell(props) {
	const { handleClickOrientation, isEditing, orientation, tabletIndex } = props;

	if (!orientation) {
		return null;
	}

	let onClick;
	let role;
	let tabIndex;
	let type;

	if (handleClickOrientation && isEditing) {
		onClick = () => handleClickOrientation(tabletIndex);
		role = 'button';
		tabIndex = 0;
		type = 'button';
	}

	return (
		<span
			type={type}
			onClick={onClick}
			onKeyPress={onClick}
			role={role}
			tabIndex={tabIndex}
			title={`${orientation === '/' ? 'Orientation S' : 'Orientation Z'}`}
		>
			<span className={`${orientation === '/' ? 's' : 'z'}`} />
		</span>
	);
}

OrientationCell.propTypes = {
	handleClickOrientation: PropTypes.func,
	isEditing: PropTypes.bool.isRequired,
	orientation: PropTypes.string,
	tabletIndex: PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		orientation: getOrientationForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(OrientationCell);
