import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { editThreadingCell } from '../modules/pattern';
import Toolbar from './Toolbar';
import './Threading.scss';
import { HOLE_LABELS } from '../../parameters';
import Palette from './Palette';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
/* eslint-disable react/no-array-index-key */

class Threading extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'selectedColor': 0,
		};

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

	handleClickPaletteCell(index) {
		console.log('clicked color', index);
		this.setState({
			'selectedColor': index,
		});
	}

	handleClickThreadingCell(rowIndex, tabletIndex, cell) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColor } = this.state;

		dispatch(editThreadingCell({
			_id,
			'hole': rowIndex,
			'tablet': tabletIndex,
			'value': selectedColor,
		}));
	}

	// TODO improve keyboard handler to only act on space or enter, for threading cell and palette color

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

		// we use children twice so that the onclick doesn't have to be passed down through Toolbar to Palette
		return (
			<div className="threading">
				{this.renderChart()}
				{ReactDOM.createPortal(
					<Toolbar>
						<Palette>
							{palette.map((color, index) => {
								const identifier = `palette-color-${index}`;

								// eslint doesn't associate the label with the span, so I've disabled the rule
								return (
									<label // eslint-disable-line jsx-a11y/label-has-associated-control
										htmlFor={identifier}
										key={identifier} // eslint-disable-line react/no-array-index-key
									>
										Color
										<span // eslint-disable-line jsx-a11y/control-has-associated-label
											className="color"
											id={identifier}
											name={identifier}

											onClick={() => this.handleClickPaletteCell(index)}
											onKeyPress={() => this.this.handleClickPaletteCell(index)}
											role="button"
											style={{ 'backgroundColor': color }}
											tabIndex="0"
										/>
									</label>
								);
							})}
						</Palette>
					</Toolbar>,
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
