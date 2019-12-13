// weaving chart for interactive weaving chart page

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { modulus } from '../modules/weavingUtils';
import ChartSVG from './ChartSVG';

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
		const {
			pattern,
			'pattern': {
				holes,
				orientations,
			},
			picksByTablet,
		} = this.props;

		const orientation = orientations[tabletIndex];
		const { direction, numberOfTurns, totalTurns } = picksByTablet[tabletIndex][rowIndex];
		const netTurns = modulus(totalTurns, holes);

		// if not idle, show direction
		let directionClass = '';
		if (numberOfTurns !== 0) {
			if (direction === 'F') {
				directionClass = 'forward';
			} else if (direction === 'B') {
				directionClass = 'backward';
			}
		}

		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				<span
					className={directionClass}
				>
					<ChartSVG
						pattern={pattern}
						direction={direction}
						netTurns={netTurns}
						numberOfTurns={numberOfTurns}
						orientation={orientation}
						tabletIndex={tabletIndex}
					/>
				</span>
			</li>
		);
	}

	renderRow(numberOfRows, row, rowIndex) {
		const rowLabel = numberOfRows - rowIndex;

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{row.map((obj, tabletIndex) => this.renderCell(rowLabel - 1, tabletIndex))}
				</ul>
			</>
		);
	}

	renderTabletLabels() {
		const { 'pattern': { numberOfTablets } } = this.props;

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
		const {
			'pattern': {
				numberOfRows,
				'patternDesign': { weavingInstructions },
			},
			selectedRow,
		} = this.props;

		return (
			<div className="weaving-chart-holder">
				{this.renderTabletLabels()}
				<ul className="weaving-chart">
					{
						weavingInstructions.map((row, index) => (
							<li
								className={`row ${index === selectedRow ? 'selected' : ''}`}
								key={`weaving-row-${index}`}
							>
								{this.renderRow(numberOfRows, row, index)}
							</li>
						))
					}
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
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'selectedRow': PropTypes.number,
};

export default WeavingChartPrint;
