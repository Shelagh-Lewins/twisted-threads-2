import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';
import AddTabletsForm from '../forms/AddTabletsForm';
import './ThreadingPrint.scss';
import { HOLE_LABELS } from '../../modules/parameters';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the threading cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class ThreadingPrint extends PureComponent {
	renderCell(colorIndex, rowIndex, tabletIndex) {
		const {
			pattern,
			'pattern': { holes, orientations },
		} = this.props;

		const orientation = orientations[tabletIndex];

		return (
			<span>
				<ChartSVG
					pattern={pattern}
					direction="F"
					netTurns={holes - rowIndex /* hole labels run bottom to top, indexes run top to bottom */}
					numberOfTurns={1}
					orientation={orientation}
					tabletIndex={tabletIndex}
				/>
			</span>
		);
	}

	renderRow(row, rowIndex) {
		const { 'pattern': { holes } } = this.props;
		const labelIndex = holes - rowIndex - 1;

		return (
			<>
				<ul className="threading-row">
					<li className="cell label"><span>{HOLE_LABELS[labelIndex]}</span></li>
					{
						row.map((colorIndex, index) => (
							<li
								className="cell value"
								key={`threading-cell-${rowIndex}-${index}`}
							>
								{this.renderCell(colorIndex, rowIndex, index)}
							</li>
						))
					}
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
		const { 'pattern': { threading } } = this.props;

		return (
			<>
				{this.renderTabletLabels()}
				<ul className="threading-chart">
					{
						threading.map((row, index) => (
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

	renderOrientation(value) {
		return (
			<span>
				<span
					className={`${value === '/' ? 's' : 'z'}`}
				/>
			</span>
		);
	}

	renderOrientations() {
		const { 'pattern': { orientations } } = this.props;

		return (
			<div className="orientations">
				<ul className="orientations">
					{
						orientations.map((value, tabletIndex) => (
							<li
								className="cell value"
								key={`orientation-${tabletIndex}`}
							>
								{this.renderOrientation(tabletIndex, orientations[tabletIndex])}
							</li>
						))
					}
				</ul>
				<p className="hint">Slope of line = angle of tablet viewed from above</p>
			</div>
		);
	}

	render() {
		return (
			<div className="threading">
				<div className="content">
					{this.renderChart()}
					{this.renderOrientations()}
				</div>
			</div>
		);
	}
}

ThreadingPrint.propTypes = {
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ThreadingPrint;
