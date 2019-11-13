import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './Threading.scss';

// row and tablet have nothing to identify them except index
/* eslint-disable react/no-array-index-key */

class Threading extends PureComponent {
	handleClick(rowIndex, tabletIndex) {
		console.log('clicked', rowIndex);
		console.log('tablet', tabletIndex);
	}

	renderCell(cell, rowIndex, tabletIndex) {
		return (
			<span
				type="button"
				onClick={() => this.handleClick(rowIndex, tabletIndex)}
				onKeyPress={() => this.handleClick(rowIndex, tabletIndex)}
				role="button"
				tabIndex="0"
			>
				{cell}
			</span>
		);
	}

	renderRow(row, rowIndex) {
		return (
			<ul className="threading-row">
				{
					row.map((cell, index) => (
						<li
							className="cell"
							key={`threading-cell-${rowIndex}-${index}`}
						>
							{this.renderCell(cell, rowIndex, index)}
						</li>
					))
				}
			</ul>
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
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
