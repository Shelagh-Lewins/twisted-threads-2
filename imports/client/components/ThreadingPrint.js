import React from 'react';
import PropTypes from 'prop-types';
import ThreadingChartCell from './ThreadingChartCell';
import OrientationCell from './OrientationCell';
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

function ThreadingPrint(props) {
	const renderCell = (rowIndex, tabletIndex) => (
		<span>
			<ThreadingChartCell
				rowIndex={rowIndex}
				tabletIndex={tabletIndex}
			/>
		</span>
	);

	const renderRow = (rowIndex) => {
		const { holes, numberOfTablets } = props;
		const labelIndex = holes - rowIndex - 1;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(
				<li
					className="cell value"
					key={`threading-cell-${rowIndex}-${i}`}
				>
					{renderCell(rowIndex, i)}
				</li>,
			);
		}

		return (
			<>
				<ul className="threading-row">
					<li className="cell label"><span>{HOLE_LABELS[labelIndex]}</span></li>
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
		const { holes } = props;
		const rows = [];
		for (let i = 0; i < holes; i += 1) {
			rows.push(
				<li
					className="row"
					key={`threading-row-${i}`}
				>
					{renderRow(i)}
				</li>,
			);
		}

		return (
			<>
				{renderTabletLabels()}
				<ul className="threading-chart">
					{rows}
				</ul>
			</>
		);
	};

	const renderOrientations = () => {
		const { numberOfTablets } = props;
		const orientations = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			orientations.push(
				<li
					className="cell value"
					key={`orientation-${i}`}
				>
					<OrientationCell
						isEditing={false}
						tabletIndex={i}
					/>
				</li>,
			);
		}

		return (
			<div className="orientations">
				<ul className="orientations">
					{orientations}
				</ul>
				<p className="hint">Slope of line = angle of tablet viewed from above</p>
			</div>
		);
	};

	return (
		<div className="threading">
			<div className="content">
				{renderChart()}
				{renderOrientations()}
			</div>
		</div>
	);
}

ThreadingPrint.propTypes = {
	'holes': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
};

export default ThreadingPrint;
