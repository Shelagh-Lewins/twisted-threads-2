import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { editOrientation, editPaletteColor, editThreadingCell } from '../modules/pattern';
import {
	SVGBackwardEmpty,
	SVGBackwardWarp,
	SVGForwardEmpty,
	SVGForwardWarp,
} from '../modules/svg';
import Toolbar from './Toolbar';
import './Threading.scss';
import { HOLE_LABELS } from '../../parameters';
import Palette from './Palette';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class Threading extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'selectedColorIndex': 0,
		};

		// Toolbar is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'toolbar-holder';

		this.selectColor = this.selectColor.bind(this);
		this.handleEditColor = this.handleEditColor.bind(this);
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
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

		dispatch(editOrientation({
			_id,
			'tablet': tabletIndex,
		}));
	}

	// TODO improve keyboard handler to only act on space or enter, for threading cell and palette color

	renderCell(colorIndex, rowIndex, tabletIndex) {
		const { pattern, 'pattern': { palette } } = this.props;

		let svg;
		const orientation = pattern.orientations[tabletIndex];

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
				onClick={() => this.handleClickThreadingCell(rowIndex, tabletIndex, colorIndex)}
				onKeyPress={() => this.handleClickThreadingCell(rowIndex, tabletIndex, colorIndex)}
				role="button"
				tabIndex="0"
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
				<span className="label">{HOLE_LABELS[labelIndex]}</span>
				<ul className="threading-row">
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
		const { pattern } = this.props;

		return (
			<>
				<h2>Threading chart</h2>
				{this.renderTabletLabels()}
				<ul className="threading-chart">
					{
						pattern.threading.map((row, index) => (
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
		return (
			<span
				type="button"
				onClick={() => this.handleClickOrientation(tabletIndex)}
				onKeyPress={() => this.handleClickOrientation(tabletIndex)}
				role="button"
				tabIndex="0"
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
								className="orientation"
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

	renderToolbar() {
		const { colorBooks, dispatch, 'pattern': { palette } } = this.props;
		const { selectedColorIndex } = this.state;

		// Toolbar will be reused when editing turning, so Palette is passed as a property (props.children).
		// This also avoids having to pass props through Toolbar to Palette.

		return (
			ReactDOM.createPortal(
				<Toolbar>
					<Palette
						colorBooks={colorBooks}
						dispatch={dispatch}
						handleEditColor={this.handleEditColor}
						palette={palette}
						selectColor={this.selectColor}
						selectedColorIndex={selectedColorIndex}
					/>
				</Toolbar>,
				this.el,
			)
		);
	}

	render() {
		return (
			<div className="threading">
				{this.renderChart()}
				{this.renderOrientations()}
				{this.renderToolbar()}
			</div>
		);
	}
}

Threading.propTypes = {
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
