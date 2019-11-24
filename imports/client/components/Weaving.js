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
import './Weaving.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class Weaving extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'toggleEditWeaving',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}


	handleClickWeavingCell(rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		/* const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editThreadingCell({
			_id,
			'hole': rowIndex,
			'tablet': tabletIndex,
			'value': selectedColorIndex,
		})); */
	}

	toggleEditWeaving() {
		const { isEditing } = this.state;

		this.setState({
			'isEditing': !isEditing,
		});
	}

	renderCell(rowIndex, tabletIndex) {
		const { pattern, 'pattern': { orientations } } = this.props;

		return (
			<span
				type="button"
				onClick={() => this.handleClickWeavingCell(rowIndex, tabletIndex)}
				onKeyPress={() => this.handleClickWeavingCell(rowIndex, tabletIndex)}
				role="button"
				tabIndex="0"
			>
				x
			</span>
		);
	}

	renderRow(numberOfRows, row, rowIndex) {
		const rowLabel = numberOfRows - rowIndex;

		return (
			<>
				<span className="label">{rowLabel}</span>
				<ul className="weaving-row">
					{
						row.map((colorIndex, index) => (
							<li
								className="cell value"
								key={`weaving-cell-${rowIndex}-${index}`}
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
					className="label"
					key={`tablet-label-${i}`}
				>
					<span>{i + 1}</span>
				</li>
			));
		}

		return <ul className="tablet-labels">{labels}</ul>;
	}

	renderChart() {
		const { 'pattern': { patternDesign } } = this.props;
		const { isEditing } = this.state;

		const weaving = patternDesign.picks;
		const numberOfRows = weaving.length;

		// TO DO derive weaving chart
		// and check for pattern type
		// console.log('patternDesign', patternDesign);
		// console.log('weaving', weaving);

		const controls = (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditWeaving}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditWeaving}>Edit weaving chart</Button>}
			</div>
		);

		return (
			<>
				<h2>Weaving chart</h2>
				{controls}
				{this.renderTabletLabels()}
				<ul className="weaving-chart">
					{
						weaving.map((row, index) => (
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
		return;
		/* const {
			colorBookAdded,
			colorBooks,
			dispatch,
			'pattern': { palette },
		} = this.props;
		const { selectedColorIndex } = this.state;

		// Toolbar will be reused when editing turning, so Palette is passed as a property (props.children).
		// This also avoids having to pass props through Toolbar to Palette.

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
		); */
	}

	render() {
		const { isEditing } = this.state;

		return (
			<div className="weaving">
				{this.renderChart()}
				{isEditing && this.renderToolbar()}
			</div>
		);
	}
}

Weaving.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Weaving;
