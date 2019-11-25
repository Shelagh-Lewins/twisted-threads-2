import React, { PureComponent } from 'react';
// import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { modulus } from '../modules/weavingUtils';
import {
	addWeavingRows,
	editWeavingCellDirection,
	removeWeavingRow,
} from '../modules/pattern';
import {
	SVGBackwardEmpty,
	SVGBackwardWarp,
	SVGForwardEmpty,
	SVGForwardWarp,
} from '../modules/svg';
import AddRowsForm from './AddRowsForm';
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
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRemoveRow',
			'handleClickWeavingCell',
			'handleSubmitAddRows',
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

		const response = confirm(`Do you want to delete row "${rowIndex + 1}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeWeavingRow({ _id, rowIndex }));
		}
	}

	handleSubmitAddRows(data) {
		const { dispatch, 'pattern': { _id } } = this.props;

		dispatch(addWeavingRows({
			_id,
			'insertNRows': parseInt(data.insertNRows, 10),
			'insertRowsAt': parseInt(data.insertRowsAt, 10),
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
			'pattern': {
				holes,
				orientations,
				palette,
				threading,
			},
			picksByTablet,
		} = this.props;
		const { isEditing } = this.state;

		let svg;
		const orientation = orientations[tabletIndex];
		const { direction, totalTurns } = picksByTablet[tabletIndex][rowIndex];
		const netTurns = modulus(totalTurns, holes);
		let holeToShow;

		if (direction === 'F') {
			// show thread in position A
			holeToShow = modulus(holes - netTurns, holes);
		} else {
			// show thread in position D
			holeToShow = modulus(holes - netTurns - 1, holes);
		}

		const colorIndex = threading[holeToShow][tabletIndex];

		let threadAngle = '/'; // which way does the thread twist?
		if (direction === 'F') {
			if (orientation === '\\') {
				threadAngle = '\\';
			}
		} else if (orientation === '/') {
			threadAngle = '\\';
		}

		if (colorIndex === -1) { // empty hole
			svg = threadAngle === '\\'
				? (
					<SVGBackwardEmpty />
				)
				: (
					<SVGForwardEmpty	/>
				);
		} else { // colored thread
			svg = threadAngle === '\\'
				? (
					<SVGBackwardWarp
						fill={palette[colorIndex]}
						stroke="#000000"
					/>
				)
				: (
					<SVGForwardWarp
						fill={palette[colorIndex]}
						stroke="#000000"
					/>
				);
		}

		return (
			<span
				className={direction === 'F' ? 'forward' : 'backward'}
				type={isEditing ? 'button' : undefined}
				onClick={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
				onKeyPress={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
				role={isEditing ? 'button' : undefined}
				tabIndex={isEditing ? '0' : undefined}
			>
				{svg}
			</span>
		);
	}

	renderRow(numberOfRows, row, rowIndex) {
		const { isEditing } = this.state;
		const rowLabel = numberOfRows - rowIndex;

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{
						row.map((obj, tabletIndex) => (
							<li
								className="cell value"
								key={`weaving-cell-${rowIndex}-${tabletIndex}`}
							>
								{this.renderCell(rowLabel - 1, tabletIndex)}
							</li>
						))
					}
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
		const { 'pattern': { tablets } } = this.props;

		const labels = [];
		for (let i = 0; i < tablets; i += 1) {
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
				<span className="hint">Click on a chart cell to edit it</span>
			</>
		);
	}

	renderToolbar() {
		const {
			'pattern': { numberOfRows },
		} = this.props;

		return (
			<AddRowsForm
				handleSubmit={this.handleSubmitAddRows}
				numberOfRows={numberOfRows}
			/>
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
