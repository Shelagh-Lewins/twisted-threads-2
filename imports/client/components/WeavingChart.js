// weaving chart for interactive weaving chart page

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { modulus } from '../modules/weavingUtils';
import ChartSVG from './ChartSVG';

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

class WeavingChart extends PureComponent {
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
		const { handleClickDown, handleClickUp } = this.props;
		const rowLabel = numberOfRows - rowIndex;

		// background images in scss are malformed: the leading / is removed so they become relative and do not point to public/images
		// https://github.com/meteor/meteor/issues/10247
		// a solution is to specify background-image with inline style
		const upUrl = Meteor.absoluteUrl('/images/up.png'); // absoluteUrl is recommended, though doesn't seem to be necessary
		const downUrl = Meteor.absoluteUrl('/images/down.png');

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{row.map((obj, tabletIndex) => this.renderCell(rowLabel - 1, tabletIndex))}
				</ul>
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
			handleClickRow,
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
								onClick={index === selectedRow ? undefined : () => handleClickRow(index)}
								onKeyPress={index === selectedRow ? undefined : () => handleClickRow(index)}
								role="button" // eslint-disable-line 
								tabIndex="0"
								type="button"
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
			<div className="weaving">
				<div className="content">
					{this.renderChart()}
				</div>
			</div>
		);
	}
}

WeavingChart.propTypes = {
	'handleClickUp': PropTypes.func.isRequired,
	'handleClickRow': PropTypes.func.isRequired,
	'handleClickDown': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'selectedRow': PropTypes.number,
};

export default WeavingChart;
