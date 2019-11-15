import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { editThreadingCell } from '../modules/pattern';
import Toolbar from './Toolbar';
import './Threading.scss';
import { HOLE_LABELS } from '../../parameters';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
/* eslint-disable react/no-array-index-key */

// TODO add hole labels

class Threading extends PureComponent {
	constructor(props) {
		super(props);

		// Toolbar will be rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'toolbar-holder';
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}
	
	handleClickPaletteCell(value) {
		console.log('clicked color', value);
	}

	handleClickThreadingCell(rowIndex, tabletIndex, cell) {
		const { dispatch, 'pattern': { _id } } = this.props;

		const value = cell === 0 ? 1 : 0;

		dispatch(editThreadingCell({
			_id,
			'hole': rowIndex,
			'tablet': tabletIndex,
			'value': value,
		}));
	}

	// TODO improve keyboard handler to only act on space or enter

	renderCell(cell, rowIndex, tabletIndex) {
		return (
			<span
				className="cell"
				type="button"
				onClick={() => this.handleClickThreadingCell(rowIndex, tabletIndex, cell)}
				onKeyPress={() => this.handleClickThreadingCell(rowIndex, tabletIndex, cell)}
				role="button"
				tabIndex="0"
			>
				{cell}
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
						row.map((cell, index) => (
							<li
								className="cell value"
								key={`threading-cell-${rowIndex}-${index}`}
							>
								{this.renderCell(cell, rowIndex, index)}
							</li>
						))
					}
				</ul>
			</>
		);
	}

	renderChart() {
		const { pattern } = this.props;

		return (
			<>
				<h2>Threading chart</h2>
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

	render() {
		// nested props
		const { 'pattern': { palette } } = this.props;

		return (
			<div className="threading">
				{this.renderChart()}
				{ReactDOM.createPortal(
					<Toolbar
						context="threading"
						handleClickPaletteCell={this.handleClickPaletteCell}
						palette={palette}
					/>,
					this.el,
				)}
			</div>
		);
	}
}

Threading.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
