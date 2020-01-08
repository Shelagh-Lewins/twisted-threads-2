// weaving chart for interactive weaving chart page

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import WeavingChartCell from './WeavingChartCell';

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
// {/* holes={holes} */}
// 					palette={palette}
class WeavingChart extends PureComponent {
	renderCell(rowIndex, tabletIndex) {
		const { holes, palette } = this.props;

		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				<WeavingChartCell
					
					holes={4}
					palette={[
	'#7A1313',
	'#C32828',
	'#f98c03',
	'#fbe158',
	'#6aa84f',
	'#1f6d1f',
	'#172f79',
	'#3670B4',
	'#76bae6',
	'#a67bc8',
	'#9025c5',
	'#000000',
	'#828282',
	'#ffffff',
	'#523f12',
	'#aa8e4b',
]}

					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			</li>
		);
	}

	renderRow(rowIndex) {
		const {
			handleClickDown,
			handleClickUp,
			numberOfRows,
			numberOfTablets,
		} = this.props;
		const rowLabel = numberOfRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(this.renderCell(rowLabel - 1, i));
		}

		// background images in scss are malformed: the leading / is removed so they become relative and do not point to public/images
		// https://github.com/meteor/meteor/issues/10247
		// a solution is to specify background-image with inline style
		const upUrl = Meteor.absoluteUrl('/images/up.png'); // absoluteUrl is recommended, though doesn't seem to be necessary
		const downUrl = Meteor.absoluteUrl('/images/down.png');

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{cells}
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
		const {
			handleClickRow,
			numberOfRows,
			selectedRow,
		} = this.props;

		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
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
	'holes': PropTypes.number.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'selectedRow': PropTypes.number,
};

export default WeavingChart;
