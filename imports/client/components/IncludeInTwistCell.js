import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
	getIncludeInTwistForTablet,
} from '../modules/pattern';

function IncludeInTwistCell(props) {
	const {
		handleChangeIncludInTwistCheckbox,
		isEditing,
		includeInTwistForTablet,
		tabletIndex,
	} = props;

	const identifier = `include-in-twist-${tabletIndex + 1}`;
	const tooltip = includeInTwistForTablet
		? `Tablet ${tabletIndex + 1}: included in twist calculations`
		: `Tablet ${tabletIndex + 1}: excluded from twist calculations`;

	return (
		<span>
			<input
				checked={includeInTwistForTablet}
				disabled={!isEditing}
				type="checkbox"
				id={identifier}
				key={identifier}
				name={identifier}
				onChange={(event) => handleChangeIncludInTwistCheckbox(event, tabletIndex)}
				title={tooltip}
			/>
			<label htmlFor="showEmailAddress">{tooltip}</label>
		</span>
	);
}

IncludeInTwistCell.propTypes = {
	'handleChangeIncludInTwistCheckbox': PropTypes.func,
	'isEditing': PropTypes.bool.isRequired,
	'includeInTwistForTablet': PropTypes.bool.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { tabletIndex } = ownProps;

	return {
		'includeInTwistForTablet': getIncludeInTwistForTablet(state, tabletIndex),
	};
}

export default connect(mapStateToProps)(IncludeInTwistCell);
