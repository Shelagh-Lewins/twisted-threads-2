// weaving chart for interactive weaving chart page

import React from 'react';
import PropTypes from 'prop-types';
import WeavingChartCell from './WeavingChartCell';
import FreehandChartCell from './FreehandChartCell';

import './Threading.scss';
import './WeavingChart.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

function WeavingChart(props) {
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
		const {
			handleClickDown,
			handleClickUp,
			numberOfRows,
			numberOfTablets,
			printView,
		} = props;
		const rowLabel = numberOfRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(renderCell(rowLabel - 1, i));
		}

		// background images in scss are malformed: the leading / is removed so they become relative and do not point to public/images
		// https://github.com/meteor/meteor/issues/10247
		// a solution is to specify background-image with inline style
		// unfortunately using relative paths in the scss like "../images/created_by.png" doesn't work reliably
		const upUrl = Meteor.absoluteUrl('/images/up.png'); // absoluteUrl is recommended, though doesn't seem to be necessary
		const downUrl = Meteor.absoluteUrl('/images/down.png');

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{cells}
				</ul>
				{!printView && (
					<div className="highlight">
						<div className="innertube" />
						<div className="buttons">
							<button
								type="button"
								className="button-up"
								onClick={handleClickUp}
								style={{ 'backgroundImage': `url('${upUrl}')` }}
							>
								Up
							</button>
							<button
								type="button"
								className="button-down"
								onClick={handleClickDown}
								style={{ 'backgroundImage': `url('${downUrl}')` }}
							>
								Down
							</button>
						</div>
					</div>
				)}
			</>
		);
	};

	const renderTabletLabels = () => {
		const {
			numberOfTablets,
			printView,
			selectedRow,
		} = props;
		let offset = 0;

		if (!printView) {
			offset = 33 * selectedRow;
		}

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

		return (
			<ul
				className="tablet-labels"
				style={{ 'top': `${offset}px` }}
			>
				{labels}
			</ul>
		);
	};

	const renderChart = () => {
		const {
			handleClickRow,
			numberOfRows,
			printView,
			selectedRow,
		} = props;

		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
			if (printView) {
				rows.push(
					<li
						className="row"
						key={`weaving-row-${i}`}
					>
						{renderRow(i)}
					</li>,
				);
			} else {
				rows.push(
					<li
						className={`row ${i === selectedRow ? 'selected' : ''}`}
						key={`weaving-row-${i}`}
						onClick={i === selectedRow ? undefined : () => handleClickRow(i)}
						onKeyPress={i === selectedRow ? undefined : () => handleClickRow(i)}
						role="button" // eslint-disable-line 
						tabIndex="0"
						type="button"
					>
						{renderRow(i)}
					</li>,
				);
			}
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

	const { printView } = props;

	return (
		<div className={`weaving ${printView && 'weaving-chart-print'}`}>
			<div className="content">
				{renderChart()}
			</div>
		</div>
	);
}

// known bug that eslint does not reliably detect props inside functions in a functional component
// https://github.com/yannickcr/eslint-plugin-react/issues/885
WeavingChart.propTypes = {
	'handleClickUp': PropTypes.func,
	'handleClickRow': PropTypes.func,
	'handleClickDown': PropTypes.func,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'patternType': PropTypes.string.isRequired,
	'printView': PropTypes.bool.isRequired,
	'selectedRow': PropTypes.number,
};

export default WeavingChart;
