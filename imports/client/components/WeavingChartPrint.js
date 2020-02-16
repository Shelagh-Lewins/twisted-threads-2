// weaving chart for interactive weaving chart page

import React from 'react';
import PropTypes from 'prop-types';
import WeavingChartCell from './WeavingChartCell';
import FreehandChartCell from './FreehandChartCell';

import './Threading.scss';
import './WeavingChartPrint.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

function WeavingChartPrint(props) {
	const renderCell = (rowIndex, tabletIndex) => {
		const { patternType } = props;
		let cell;

		if (patternType === 'freehand') {
			cell = (
				<FreehandChartCell
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			);
		} else {
			cell = (
				<WeavingChartCell
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			);
		}

		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				{cell}
			</li>
		);
	};

	const renderRow = (rowIndex) => {
		const { numberOfRows, numberOfTablets } = props;
		const rowLabel = numberOfRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(renderCell(rowLabel - 1, i));
		}

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{cells}
				</ul>
			</>
		);
	};

	const renderTabletLabels = () => {
		const { numberOfTablets } = props;

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
	};

	const renderChart = () => {
		const { numberOfRows } = props;
		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
			rows.push(
				<li
					className="row"
					key={`weaving-row-${i}`}
				>
					{renderRow(i)}
				</li>,
			);
		}

		return (
			<div className="weaving-chart-holder">
				{renderTabletLabels()}
				<ul className="weaving-chart">
					{rows}
				</ul>
			</div>
		);
	};

	return (
		<div className="weaving-chart-print">
			<div className="content">
				{renderChart()}
			</div>
		</div>
	);
}

WeavingChartPrint.propTypes = {
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'patternType': PropTypes.string.isRequired,
};

export default WeavingChartPrint;
