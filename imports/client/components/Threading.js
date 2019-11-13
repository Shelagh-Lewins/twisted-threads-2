import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { editThreadingCell } from '../modules/pattern';
import './Threading.scss';
import { HOLE_LABELS } from '../../parameters';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
/* eslint-disable react/no-array-index-key */

// TODO add hole labels

class Threading extends PureComponent {
	handleClick(rowIndex, tabletIndex, cell) {
		const { dispatch, 'pattern': { _id } } = this.props;

		const value = cell === 0 ? 1 : 0;

		dispatch(editThreadingCell({
			_id,
			'hole': rowIndex,
			'tablet': tabletIndex,
			'value': value,
		}));
	}

	renderCell(cell, rowIndex, tabletIndex) {
		return (
			<span
				className="cell"
				type="button"
				onClick={() => this.handleClick(rowIndex, tabletIndex, cell)}
				onKeyPress={() => this.handleClick(rowIndex, tabletIndex, cell)}
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
		return (
			<div className="threading">
				{this.renderChart()}
			</div>
		);
	}
}

Threading.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
