import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
	addWeavingRows,
	editWeavingRowDirection,
	removeWeavingRows,
	setIsEditingWeaving,
} from '../modules/pattern';
import AllTogetherRowsForm from '../forms/AllTogetherRowsForm';

import './WeavingDesignAllTogether.scss';

class WeavingDesignAllTogether extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleChangeNumberOfRows',
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

		const row = parseInt(event.target.value, 10);
		dispatch(editWeavingRowDirection({ _id, row }));
	}

	handleChangeNumberOfRows(newNumberOfRows) {
		const {
			dispatch,
			numberOfRows,
			'pattern': { _id },
		} = this.props;

		// rows are added and removed at the end
		if (newNumberOfRows > numberOfRows) {
			dispatch(addWeavingRows({
				_id,
				'insertNRows': newNumberOfRows - numberOfRows,
				'insertRowsAt': numberOfRows,
			}));
		} else if (newNumberOfRows < numberOfRows) {
			dispatch(removeWeavingRows({
				_id,
				'removeNRows': numberOfRows - newNumberOfRows,
				'removeRowsAt': numberOfRows - 1,
			}));
		}
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
				<span className="row-number">{index + 1}</span>
			</Button>
		);
	}

	renderRowsForm() {
		const {
			numberOfRows,
		} = this.props;
		const { isEditing } = this.state;

		return (
			<AllTogetherRowsForm
				canEdit={isEditing}
				handleSubmit={this.handleChangeNumberOfRows}
				numberOfRows={numberOfRows}
			/>
		);
	}

	renderWeavingInstructions() {
		const {
			'patternDesign': { weavingInstructions },
		} = this.props;

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
			<div className={`weaving-all-together ${isEditing ? 'editing' : ''}`}>
				<div>Turn all tablets together, forward or backward, following the sequence shown below</div>
				{canEdit && this.renderControls()}
				<div
					className="content"
				>
					{this.renderRowsForm()}
					{this.renderWeavingInstructions()}
					<div className="clearing" />
				</div>
			</div>
		);
	}
}


WeavingDesignAllTogether.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired, // updated in state
};

function mapStateToProps(state) {
	return {
		'patternDesign': state.pattern.patternDesign,
	};
}

// we need forwardRef to allow the wrapped component to be referenced from the Pattern.js component
export default connect(mapStateToProps, null, null, { 'forwardRef': true })(WeavingDesignAllTogether);
