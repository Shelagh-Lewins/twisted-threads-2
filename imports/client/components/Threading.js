import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import {
	addTablets,
	editOrientation,
	editPaletteColor,
	editThreadingCell,
	removeTablet,
} from '../modules/pattern';
import ThreadingChartCell from './ThreadingChartCell';
import AddTabletsForm from '../forms/AddTabletsForm';
import './Threading.scss';
import { DEFAULT_PALETTE, HOLE_LABELS } from '../../modules/parameters';
import Palette from './Palette';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the threading cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class Threading extends PureComponent {
	paletteId = 'threading-palette';

	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
			'selectedColorIndex': 0,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRemoveTablet',
			'handleClickRestoreDefaults',
			'handleEditColor',
			'handleSubmitAddTablets',
			'selectColor',
			'toggleEditThreading',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
		});
	}

	handleClickRemoveTablet(tabletIndex) {
		const {
			'pattern': { _id },
			dispatch,
		} = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const response = confirm(`Do you want to delete tablet ${tabletIndex + 1}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeTablet({ _id, 'tablet': tabletIndex }));
		}
	}

	handleClickRestoreDefaults() {
		const { dispatch, 'pattern': { _id } } = this.props;

		DEFAULT_PALETTE.forEach((colorHexValue, index) => {
			dispatch(editPaletteColor({
				_id,
				'colorHexValue': colorHexValue,
				'colorIndex': index,
			}));
		});
	}

	handleEditColor(colorHexValue) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editPaletteColor({
			_id,
			'colorHexValue': colorHexValue,
			'colorIndex': selectedColorIndex,
		}));
	}

	handleSubmitAddTablets(data) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(addTablets({
			_id,
			'insertNTablets': parseInt(data.insertNTablets, 10),
			'insertTabletsAt': parseInt(data.insertTabletsAt - 1, 10),
			'colorIndex': parseInt(selectedColorIndex, 10),
		}));
	}

	handleClickThreadingCell(rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editThreadingCell({
			_id,
			'hole': rowIndex,
			'tablet': tabletIndex,
			'colorIndex': selectedColorIndex,
		}));
	}

	handleClickOrientation(tabletIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		dispatch(editOrientation({
			_id,
			'tablet': tabletIndex,
		}));
	}

	toggleEditThreading() {
		const { isEditing } = this.state;

		this.setState({
			'isEditing': !isEditing,
		});

		if (!isEditing) {
			setTimeout(() => {
				const element = document.getElementById(this.paletteId);
				element.scrollIntoView({ 'behavior': 'smooth' });
			}, 200);
		}
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditThreading}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditThreading}>Edit threading chart</Button>}
			</div>
		);
	}

	renderCell(colorIndex, rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		return (
			<span
				type={isEditing ? 'button' : undefined}
				onClick={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
				onKeyPress={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
				role={isEditing ? 'button' : undefined}
				tabIndex={isEditing ? '0' : undefined}
			>
				<ThreadingChartCell
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			</span>
		);
	}

	renderRow(row, rowIndex) {
		const { 'pattern': { holes } } = this.props;
		const labelIndex = holes - rowIndex - 1;

		return (
			<>
				<ul className="threading-row">
					<li className="cell label"><span>{HOLE_LABELS[labelIndex]}</span></li>
					{
						row.map((colorIndex, index) => (
							<li
								className="cell value"
								key={`threading-cell-${rowIndex}-${index}`}
							>
								{this.renderCell(colorIndex, rowIndex, index)}
							</li>
						))
					}
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
		const { 'pattern': { threading } } = this.props;

		return (
			<>
				{this.renderTabletLabels()}
				<ul className="threading-chart">
					{
						threading.map((row, index) => (
							<li
								className="row"
								key={`threading-row-${index}`}
							>
								{this.renderRow(row, index)}
							</li>
						))
					}
				</ul>
			</>
		);
	}

	renderRemoveTabletButton(tabletIndex) {
		return (
			<span
				type="button"
				onClick={() => this.handleClickRemoveTablet(tabletIndex)}
				onKeyPress={() => this.handleClickRemoveTablet(tabletIndex)}
				role="button"
				tabIndex="0"
				title={`Delete tablet ${tabletIndex}`}
			>
			X
			</span>
		);
	}

	renderRemoveTabletButtons() {
		const { 'pattern': { numberOfTablets } } = this.props;
		const buttons = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			buttons.push(
				<li
					className="cell delete"
					key={`orientation-${i}`}
				>
					{this.renderRemoveTabletButton(i)}
				</li>,
			);
		}

		return (
			<div className="remove-tablet-buttons">
				<ul className="remove-tablet-buttons">
					{buttons}
				</ul>
				<p className="hint">Slope of line = angle of tablet viewed from above</p>
			</div>
		);
	}

	renderOrientation(tabletIndex, value) {
		const { isEditing } = this.state;

		return (
			<span
				type={isEditing ? 'button' : undefined}
				onClick={isEditing ? () => this.handleClickOrientation(tabletIndex) : undefined}
				onKeyPress={isEditing ? () => this.handleClickOrientation(tabletIndex) : undefined}
				role={isEditing ? 'button' : undefined}
				tabIndex={isEditing ? '0' : undefined}
				title={`${value === '/' ? 'Orientation S' : 'Orientation Z'}`}
			>
				<span
					className={`${value === '/' ? 's' : 'z'}`}
				/>
			</span>
		);
	}

	renderOrientations() {
		const { 'pattern': { orientations } } = this.props;

		return (
			<div className="orientations">
				<ul className="orientations">
					{
						orientations.map((value, tabletIndex) => (
							<li
								className="cell value"
								key={`orientation-${tabletIndex}`}
							>
								{this.renderOrientation(tabletIndex, orientations[tabletIndex])}
							</li>
						))
					}
				</ul>
				<p className="hint">Slope of line = angle of tablet viewed from above</p>
			</div>
		);
	}

	renderToolbar() {
		const {
			'pattern': { numberOfTablets },
		} = this.props;

		return (
			<AddTabletsForm
				handleSubmit={this.handleSubmitAddTablets}
				numberOfTablets={numberOfTablets}
				enableReinitialize={true}
			/>
		);
	}

	renderPalette() {
		const {
			canCreateColorBook,
			colorBookAdded,
			colorBooks,
			dispatch,
			'pattern': { palette },
		} = this.props;
		const { selectedColorIndex } = this.state;

		return (
			<Palette
				canCreateColorBook={canCreateColorBook}
				colorBookAdded={colorBookAdded}
				colorBooks={colorBooks}
				dispatch={dispatch}
				elementId={this.paletteId}
				handleClickRestoreDefaults={this.handleClickRestoreDefaults}
				handleEditColor={this.handleEditColor}
				palette={palette}
				selectColor={this.selectColor}
				selectedColorIndex={selectedColorIndex}
			/>
		);
	}

	render() {
		const { canEdit } = this.props;
		const { isEditing } = this.state;

		return (
			<div className={`threading ${isEditing ? 'editing' : ''}`}>
				{canEdit && this.renderControls()}
				<div className="content">
					{this.renderChart()}
					{isEditing && this.renderRemoveTabletButtons()}
					{this.renderOrientations()}
					{isEditing && this.renderToolbar()}
					{isEditing && this.renderPalette()}
				</div>
			</div>
		);
	}
}

Threading.propTypes = {
	'canCreateColorBook': PropTypes.bool.isRequired,
	'canEdit': PropTypes.bool.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
