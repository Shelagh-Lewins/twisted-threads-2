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
			handleSubmit,
			numberOfTurns,
		} = this.props;

		return (
			<EditWeavingCellForm
				handleSubmit={handleSubmit}
				numberOfTurns={numberOfTurns}
			/>
		);
	}
}

EditWeavingCellFormWrapper.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
	'rowIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
	'tabletIndex': PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
};

function mapStateToProps(state, ownProps) {
	const { rowIndex, tabletIndex } = ownProps;

	return {
		'numberOfTurns': getPick(state, rowIndex, tabletIndex).numberOfTurns,
	};
}

export default connect(mapStateToProps)(EditWeavingCellFormWrapper);
