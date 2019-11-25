import React, { PureComponent } from 'react';
// import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { editOrientation, editPaletteColor, editThreadingCell } from '../modules/pattern';
import {
	SVGBackwardEmpty,
	SVGBackwardWarp,
	SVGForwardEmpty,
	SVGForwardWarp,
} from '../modules/svg';
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
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
			'selectedColorIndex': 0,
		};

		this.selectColor = this.selectColor.bind(this);
		this.handleEditColor = this.handleEditColor.bind(this);

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRestoreDefaults',
			'handleEditColor',
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
			'value': selectedColorIndex,
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
				const element = document.getElementById('palette');
				element.scrollIntoView();
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
		const { 'pattern': { orientations, palette } } = this.props;
		const { isEditing } = this.state;

		let svg;
		const orientation = orientations[tabletIndex];

		if (colorIndex === -1) { // empty hole
			svg = orientation === '\\'
				? (
					<SVGBackwardEmpty />
				)
				: (
					<SVGForwardEmpty	/>
				);
		} else { // colored thread
			svg = orientation === '\\'
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
				type={isEditing ? 'button' : undefined}
				onClick={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
				onKeyPress={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
				role={isEditing ? 'button' : undefined}
				tabIndex={isEditing ? '0' : undefined}
			>
				{svg}
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
			<>
				<ul className="orientations">
					{
						orientations.map((value, tabletIndex) => (
							<li
								className="cell value"
								key={`orientations-${tabletIndex}`}
							>
								{this.renderOrientation(tabletIndex, orientations[tabletIndex])}
							</li>
						))
					}
				</ul>
				<p className="hint">Slope of line = angle of tablet viewed from above</p>
			</>
		);
	}

	renderPalette() {
		const {
			colorBookAdded,
			colorBooks,
			dispatch,
			'pattern': { palette },
		} = this.props;
		const { selectedColorIndex } = this.state;

		return (
			<Palette
				colorBookAdded={colorBookAdded}
				colorBooks={colorBooks}
				dispatch={dispatch}
				handleClickRestoreDefaults={this.handleClickRestoreDefaults}
				handleEditColor={this.handleEditColor}
				palette={palette}
				selectColor={this.selectColor}
				selectedColorIndex={selectedColorIndex}
			/>
		);
	}

	render() {
		const { isEditing } = this.state;

		return (
			<div className={`threading ${isEditing ? 'editing' : ''}`}>
				<h2>Threading chart</h2>
				{this.renderControls()}
				<div className="content">
					{this.renderChart()}
					{this.renderOrientations()}
					{isEditing && this.renderPalette()}
				</div>
			</div>
		);
	}
}

Threading.propTypes = {
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
