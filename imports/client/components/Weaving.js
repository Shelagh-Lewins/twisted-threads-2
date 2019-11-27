import React, { PureComponent } from 'react';
// import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { modulus } from '../modules/weavingUtils';
import {
	addWeavingRows,
	editWeavingCellDirection,
	editWeavingCellNumberOfTurns,
	removeWeavingRow,
} from '../modules/pattern';
import ChartSVG from './ChartSVG';
import AddRowsForm from './AddRowsForm';
import EditWeavingCellForm from './EditWeavingCellForm';
import './Threading.scss';
import './Weaving.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class Weaving extends PureComponent {
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
		const { picksByTablet } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const currentDirection = picksByTablet[tabletIndex][rowIndex].direction;

		const { dispatch, 'pattern': { _id } } = this.props;

		dispatch(editWeavingCellDirection({
			_id,
			'row': rowIndex,
			'tablet': tabletIndex,
			'direction': currentDirection === 'F' ? 'B' : 'F',
		}));

		this.setState({
			'selectedCell': [rowIndex, tabletIndex],
		});
	}

	handleClickRemoveRow(rowIndex) {
		const {
			'pattern': { _id },
			dispatch,
		} = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const response = confirm(`Do you want to delete row ${rowIndex + 1}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeWeavingRow({ _id, rowIndex }));
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
		const {
			pattern,
			'pattern': {
				holes,
				orientations,
			},
			picksByTablet,
		} = this.props;
		const { isEditing, selectedCell } = this.state;

		let isSelected = false;
		if (selectedCell) {
			isSelected = rowIndex === selectedCell[0] && tabletIndex === selectedCell[1];
		}

		const orientation = orientations[tabletIndex];
		const { direction, numberOfTurns, totalTurns } = picksByTablet[tabletIndex][rowIndex];
		const netTurns = modulus(totalTurns, holes);

		// if not idle, show direction
		let directionClass = '';
		if (numberOfTurns !== 0) {
			if (direction === 'F') {
				directionClass = 'forward';
			} else if (direction === 'B') {
				directionClass = 'backward';
			}
		}

		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				<span
					className={`${directionClass} ${isSelected ? 'selected' : ''}`}
					type={isEditing ? 'button' : undefined}
					onClick={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					onKeyPress={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					role={isEditing ? 'button' : undefined}
					tabIndex={isEditing ? '0' : undefined}
				>
					<ChartSVG
						pattern={pattern}
						direction={direction}
						netTurns={netTurns}
						numberOfTurns={numberOfTurns}
						orientation={orientation}
						tabletIndex={tabletIndex}
					/>
				</span>
			</li>
		);
	}

	renderRow(numberOfRows, row, rowIndex) {
		const { isEditing } = this.state;
		const rowLabel = numberOfRows - rowIndex;

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{row.map((obj, tabletIndex) => this.renderCell(rowLabel - 1, tabletIndex))}
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
		const { 'pattern': { numberOfTablets } } = this.props;

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
		const { 'pattern': { numberOfRows, 'patternDesign': { weavingInstructions } } } = this.props;

		return (
			<>
				{this.renderTabletLabels()}
				<ul className="weaving-chart">
					{
						weavingInstructions.map((row, index) => (
							<li
								className="row"
								key={`weaving-row-${index}`}
							>
								{this.renderRow(numberOfRows, row, index)}
							</li>
						))
					}
				</ul>
			</>
		);
	}

	renderToolbar() {
		const {
			'pattern': { numberOfRows },
			picksByTablet,
		} = this.props;
		const { selectedCell } = this.state;

		let rowIndex;
		let tabletIndex;
		let pick;

		if (selectedCell) {
			[rowIndex, tabletIndex] = selectedCell;
			pick = picksByTablet[tabletIndex][rowIndex];
		}

		return (
			<div className="weaving-toolbar">
				<span className="hint">Click on a chart cell to edit it</span>
				{selectedCell && (
					<EditWeavingCellForm
						enableReinitialize={true}
						handleSubmit={this.handleSubmitEditWeavingCellForm}
						numberOfTurns={pick.numberOfTurns}
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
		const { isEditing } = this.state;

		return (
			<div className={`weaving ${isEditing ? 'editing' : ''}`}>
				<h2>Weaving chart</h2>
				{this.renderControls()}
				<div className="content">
					{this.renderChart()}
					{isEditing && this.renderToolbar()}
				</div>
			</div>
		);
	}
}

Weaving.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default Weaving;
