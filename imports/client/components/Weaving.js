import React, { PureComponent } from 'react';
// import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { modulus } from '../modules/weavingUtils';
import { editOrientation, editPaletteColor, editThreadingCell } from '../modules/pattern';
import {
	SVGBackwardEmpty,
	SVGBackwardWarp,
	SVGForwardEmpty,
	SVGForwardWarp,
} from '../modules/svg';
import './Threading.scss';
// import { getPicksFromPatternDesign } from '../modules/weavingUtils';
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
		const {
			'pattern': {
				holes,
				orientations,
				palette,
				threading,
			},
			picks,
		} = this.props;

		// console.log('rowIndex', rowIndex);
		// console.log('tabletIndex', tabletIndex);
		// let colorIndex = 0; // TO DO find from number of turns
		let svg;
		const orientation = orientations[tabletIndex];
		const { totalTurns } = picks[rowIndex][tabletIndex];
		const netTurns = modulus(totalTurns + 1, holes);
		//console.log('totalTurns', totalTurns);
		//console.log('netTurns', netTurns);
		//console.log('holes', holes);
		const colorIndex = threading[netTurns][tabletIndex];

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
				type="button"
				onClick={() => this.handleClickWeavingCell(rowIndex, tabletIndex)}
				onKeyPress={() => this.handleClickWeavingCell(rowIndex, tabletIndex)}
				role="button"
				tabIndex="0"
			>
				{svg}
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
						row.map((obj, tabletIndex) => (
							<li
								className="cell value"
								key={`weaving-cell-${rowIndex}-${tabletIndex}`}
							>
								{this.renderCell(rowIndex, tabletIndex)}
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
		const { picks } = this.props;
		const { isEditing } = this.state;

		// const picks = getPicksFromPatternDesign({ patternDesign, patternType });

		const numberOfRows = picks.length;

		// TO DO derive weaving chart
		// and check for pattern type
		// console.log('patternDesign', patternDesign);
		// console.log('picks', picks);

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
						picks.map((row, index) => (
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
	'picks': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default Weaving;
