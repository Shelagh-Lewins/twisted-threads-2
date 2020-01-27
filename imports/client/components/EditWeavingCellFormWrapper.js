import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import EditWeavingCellForm from '../forms/EditWeavingCellForm';
import {
	getPick,
} from '../modules/pattern';
// this component exists purely to find the current value of numberOfTurns from the store

class EditWeavingCellFormWrapper extends PureComponent {
	render() {
		const {
			canEdit,
			handleSubmit,
			numberOfTurns,
		} = this.props;

		return (
			<EditWeavingCellForm
				canEdit={canEdit}
				handleSubmit={handleSubmit}
				numberOfTurns={numberOfTurns}
			/>
		);
	}
}

EditWeavingCellFormWrapper.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'rowIndex': PropTypes.number, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number, // eslint-disable-line react/no-unused-prop-types
};

function mapStateToProps(state, ownProps) {
	const { rowIndex, tabletIndex } = ownProps;

	if (typeof tabletIndex !== 'undefined'
		&& typeof rowIndex !== 'undefined') {
		const pick = getPick(state, tabletIndex, rowIndex);

		// timing issues can cause chart to try to update with a non-existent row index after removing rows
		if (typeof pick !== 'undefined') {
			return {
				'numberOfTurns': getPick(state, tabletIndex, rowIndex).numberOfTurns,
			};
		}
	}

	return {
		'numberOfTurns': 0,
	};
}

export default connect(mapStateToProps)(EditWeavingCellFormWrapper);
