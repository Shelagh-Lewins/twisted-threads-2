import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import {
	addWeavingRows,
	editWeavingCellDirection,
	editWeavingCellNumberOfTurns,
	removeWeavingRow,
} from '../modules/pattern';
import WeavingChartCell from './WeavingChartCell';
import AddRowsForm from '../forms/AddRowsForm';
import EditWeavingCellFormWrapper from './EditWeavingCellFormWrapper';
import './Threading.scss';
import './WeavingDesign.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingDesign extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
			'selectedCell': undefined,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRemoveRow',
			'handleClickWeavingCell',
			'handleSubmitAddRows',
			'handleSubmitEditWeavingCellForm',
			'toggleEditWeaving',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	handleClickWeavingCell(rowIndex, tabletIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		dispatch(editWeavingCellDirection({
			_id,
			'row': rowIndex,
			'tablet': tabletIndex,
		}));

		this.setState({
			'selectedCell': [rowIndex, tabletIndex],
		});
	}

	handleClickRemoveRow(rowIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const response = confirm(`Do you want to delete row ${rowIndex + 1}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeWeavingRow({ _id, 'row': rowIndex }));
		}
	}

	handleSubmitAddRows(data) {
		const { dispatch, 'pattern': { _id } } = this.props;

		dispatch(addWeavingRows({
			_id,
			'insertNRows': parseInt(data.insertNRows, 10),
			'insertRowsAt': parseInt(data.insertRowsAt - 1, 10),
		}));
	}

	handleSubmitEditWeavingCellForm(data) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedCell } = this.state;

		if (!selectedCell) {
			return;
		}

		dispatch(editWeavingCellNumberOfTurns({
			_id,
			'row': selectedCell[0],
			'tablet': selectedCell[1],
			'numberOfTurns': parseInt(data.numberOfTurns, 10),
		}));
	}

	toggleEditWeaving() {
		const { isEditing } = this.state;

		this.setState({
			'isEditing': !isEditing,
		});
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditWeaving}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditWeaving}>Edit weaving chart</Button>}
			</div>
		);
	}

	renderCell(rowIndex, tabletIndex) {
		const { holes, palette } = this.props;
		const { isEditing, selectedCell } = this.state;

		let isSelected = false;
		if (selectedCell) {
			isSelected = rowIndex === selectedCell[0] && tabletIndex === selectedCell[1];
		}

		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				<span
					className={`${isSelected ? 'selected' : ''}`}
					type={isEditing ? 'button' : undefined}
					onClick={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					onKeyPress={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					role={isEditing ? 'button' : undefined}
					tabIndex={isEditing ? '0' : undefined}
				>
					<WeavingChartCell
						holes={holes}
						palette={palette}
						rowIndex={rowIndex}
						tabletIndex={tabletIndex}
					/>
				</span>
			</li>
		);
	}

	renderRow(rowIndex) {
		const { numberOfRows, numberOfTablets } = this.props;
		const { isEditing } = this.state;
		const rowLabel = numberOfRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(this.renderCell(rowLabel - 1, i));
		}

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{cells}
					{isEditing && numberOfRows > 1 && (
						<li className="cell delete">
							<span
								title="delete row"
								type="button"
								onClick={() => this.handleClickRemoveRow(rowLabel - 1)}
								onKeyPress={() => this.handleClickRemoveRow(rowLabel - 1)}
								role="button"
								tabIndex="0"
							>
							X
							</span>
						</li>
					)}
				</ul>
			</>
		);
	}

	renderTabletLabels() {
		const { numberOfTablets } = this.props;

		const labels = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			labels.push((
				<li
					className="cell label"
					key={`tablet-label-${i}`}
				>
					<span>{i + 1}</span>
				</li>
			));
		}

		return <ul className="tablet-labels">{labels}</ul>;
	}

	renderChart() {
		const { numberOfRows } = this.props;
		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
			rows.push(
				<li
					className="row"
					key={`weaving-row-${i}`}
				>
					{this.renderRow(i)}
				</li>,
			);
		}

		return (
			<>
				<ul className="weaving-chart">
					{rows}
				</ul>
				{this.renderTabletLabels()}
			</>
		);
	}

	renderToolbar() {
		const {
			numberOfRows,
		} = this.props;
		const { selectedCell } = this.state;

		let rowIndex;
		let tabletIndex;

		if (selectedCell) {
			[rowIndex, tabletIndex] = selectedCell;
		}

		return (
			<div className="weaving-toolbar">
				<span className="hint">Click on a chart cell to edit it</span>
				{selectedCell && (
					<EditWeavingCellFormWrapper
						handleSubmit={this.handleSubmitEditWeavingCellForm}
						rowIndex={rowIndex}
						tabletIndex={tabletIndex}
					/>
				)}
				<AddRowsForm
					enableReinitialize={true}
					handleSubmit={this.handleSubmitAddRows}
					numberOfRows={numberOfRows}
				/>
			</div>
		);
	}

	render() {
		const { 'pattern': { createdBy } } = this.props;
		const { isEditing } = this.state;
		const canEdit = createdBy === Meteor.userId();

		return (
			<div className={`weaving ${isEditing ? 'editing' : ''}`}>
				{canEdit && this.renderControls()}
				<div className="content">
					{this.renderChart()}
					{isEditing && this.renderToolbar()}
				</div>
			</div>
		);
	}
}

WeavingDesign.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WeavingDesign;
