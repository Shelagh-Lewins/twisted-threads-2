import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
	editWeavingRowDirection,
	setIsEditingWeaving,
} from '../modules/pattern';

import './WeavingDesignAllTogether.scss';

class WeavingDesignAllTogether extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRowDirection',
			'toggleEditWeaving',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	toggleEditWeaving() {
		const { dispatch } = this.props;
		const { isEditing } = this.state;

		this.setState({
			'isEditing': !isEditing,
		});

		this.setState({
			'isEditing': !isEditing,
		});

		dispatch(setIsEditingWeaving(!isEditing));
	}

	handleClickRowDirection(event) {
		const {
			dispatch,
			'pattern': { _id },
		} = this.props;
		console.log('handleClickRowDirection', event.target.value);
		const row = parseInt(event.target.value, 10);
		dispatch(editWeavingRowDirection({ _id, row }));
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditWeaving}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditWeaving}>Edit weaving instructions</Button>}
			</div>
		);
	}

	renderRowDirectionButton(direction, index) { // eslint-disable class-methods-use-this
		const { isEditing } = this.state;

		return (
			<Button
				disabled={!isEditing}
				key={`row-${index}`}
				onClick={this.handleClickRowDirection}
				value={index}
			>
				{direction === 'F' ? 'F' : 'B'}
			</Button>
		);
	}

	renderWeavingInstructions() {
		const {
			'pattern': { numberOfRows },
			'patternDesign': { weavingInstructions },
		} = this.props;

console.log('weavingInstructions', weavingInstructions);
		return (
			<div className="weaving-instructions">
				<div className="row-direction-buttons">
					{weavingInstructions.map((direction, index) => this.renderRowDirectionButton(direction, index))}
				</div>
			</div>
		);
	}

	render() {
		const { 'pattern': { createdBy } } = this.props;
		const { isEditing } = this.state;
		const canEdit = createdBy === Meteor.userId();

		return (
			<div className={`weaving ${isEditing ? 'editing' : ''}`}>
				<div>Turn all tablets together, forward or backward, following the sequence shown below</div>
				{canEdit && this.renderControls()}
				<div
					className="content"
				>
					{this.renderWeavingInstructions()}
					<div className="clearing" />
				</div>
			</div>
		);
	}
}


WeavingDesignAllTogether.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired, // updated in state
};

function mapStateToProps(state) {
	return {
		'patternDesign': state.pattern.patternDesign,
	};
}

export default connect(mapStateToProps)(WeavingDesignAllTogether);
