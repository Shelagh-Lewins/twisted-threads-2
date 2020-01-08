// weaving chart for interactive weaving chart page

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import WeavingChartCell from './WeavingChartCell';

import './Threading.scss';
import './WeavingChartPrint.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingChartPrint extends PureComponent {
	renderCell(rowIndex, tabletIndex) {
		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				<WeavingChartCell
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			</li>
		);
	}

	renderRow(rowIndex) {
		const { numberOfRows, numberOfTablets } = this.props;
		const rowLabel = numberOfRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(this.renderCell(rowLabel - 1, i));
		}

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{cells}
				</ul>
			</>
		);
	}

	renderTabletLabels() {
		const { numberOfTablets } = this.props;

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
		const { numberOfRows } = this.props;
		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
			rows.push(
				<li
					className="row"
					key={`weaving-row-${i}`}
				>
					{this.renderRow(i)}
				</li>,
			);
		}

		return (
			<div className="weaving-chart-holder">
				{this.renderTabletLabels()}
				<ul className="weaving-chart">
					{rows}
				</ul>
			</div>
		);
	}

	render() {
		return (
			<div className="weaving-chart-print">
				<div className="content">
					{this.renderChart()}
				</div>
			</div>
		);
	}
}

WeavingChartPrint.propTypes = {
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
};

export default WeavingChartPrint;
