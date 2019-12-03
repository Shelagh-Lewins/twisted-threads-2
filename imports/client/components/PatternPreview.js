import React from 'react';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';
import { modulus } from '../modules/weavingUtils';
import { PathWeft } from '../modules/previewPaths';

import './PatternPreview.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// TO DO row numbers, number of turns, tablet numbers, repeats, points where tablets are in original position

export default function PatternPreview(props) {
	const {
		pattern,
		'pattern': {
			holes,
			numberOfRows,
			numberOfTablets,
			previewOrientation,
			weftColor,
		},
		picksByTablet,
	} = props;

	// pick graphic size in the SVG
	const unitWidth = 41.560534;
	const unitHeight = 113.08752;

	// screen pixel size of pick graphic, used to calculate final size of preview holder
	const cellHeight = 54;
	const cellWidth = 20;
	const weftOverlap = 0.2; // how much the weft sticks out each side

	const numberOfRepeats = 1; // TODO calculate and repeat
	const widthInUnits = numberOfTablets + (weftOverlap * 2);
	const heightInUnits = (numberOfRows + 1) / 2;

	const viewboxHeight = unitHeight * heightInUnits;
	const viewboxWidth = unitWidth * widthInUnits;
	const viewBox = `0 0 ${viewboxWidth} ${viewboxHeight}`;
	const imageHeight = cellHeight * heightInUnits;
	const imageWidth = cellWidth * widthInUnits;

	// elements overlap by half their height
	// so total height is half their height * number of rows
	// plus another half height that sticks out the top
	const totalHeight = imageHeight * numberOfRepeats;

	let previewStyle = {};
	let holderStyle = {};
	let wrapperStyle = {};
	let tabletLabelsStyle = {};
	let totalTurnsDisplayStyle = {};
	let rowNumbersStyle = {};
	const tabletLabelsAllowance = 60; // allow for labels which aren't part of the main svg
	const tabletLabelsOffset = 10; // push the labels to the side
	const adjustedHeight = totalHeight + tabletLabelsAllowance;
	const rowNumbersAllowance = cellWidth * 1.5;

	// corrections for rotation
	switch (previewOrientation) {
		case 'up':
			holderStyle = {
				'height': `${totalHeight}px`,
				'width': `${imageWidth}px`,
			};
			break;

		case 'left':
			previewStyle = {
				'width': `${adjustedHeight}px`,
			};
			holderStyle = {
				'height': `${imageWidth}px`,
				'width': `${totalHeight}px`,
			};
			wrapperStyle = {
				'msTransform': `translate(0, ${imageWidth + rowNumbersAllowance}px) rotate(-90deg)`,
				'WebkitTransform': `translate(0, ${imageWidth + rowNumbersAllowance}px)rotate(-90deg)`,
				'transform': `translate(0, ${imageWidth + rowNumbersAllowance}px)rotate(-90deg)`,
				'transformOrigin': 'top left',
			};
			tabletLabelsStyle = {
				'top': `${totalHeight - imageWidth + tabletLabelsOffset}px`,
			};
			break;

		case 'right':
			previewStyle = {
				'width': `${adjustedHeight}px`,
			};
			holderStyle = {
				'height': `${imageWidth}px`,
				'width': `${totalHeight}px`,
				'transform': `translate(0, -${tabletLabelsOffset}px)`,
			};
			wrapperStyle = {
				'msTransform': `translate(${totalHeight + rowNumbersAllowance}px, 0) rotate(90deg)`,
				'WebkitTransform': `translate(${totalHeight + rowNumbersAllowance}px, 0) rotate(90deg)`,
				'transform': `translate(${totalHeight + rowNumbersAllowance}px, 0) rotate(90deg)`,
				'transformOrigin': 'top left',
			};
			tabletLabelsStyle = {
				'top': `${totalHeight - imageWidth - tabletLabelsOffset}px`,
			};
			totalTurnsDisplayStyle = {
				'transform': `translate(0, -${tabletLabelsOffset}px)`,
			};
			rowNumbersStyle = {
				'transform': `translate(0, -${tabletLabelsOffset}px)`,
			};
			break;

		default:
			break;
	}

	// /////////////
	const wefts = [];

	for (let i = 0; i < numberOfRows; i += 1) {
		// position the weft
		const xOffset = 0;
		const yOffset = ((numberOfRows - i - 1) * (unitHeight / 2));
		const transform = `translate(${xOffset} ${yOffset})`;

		wefts.push(
			<g key={`prevew-weft-${i}`} transform={transform}>
				<PathWeft
					fill={weftColor}
					scale={numberOfTablets + 2 * weftOverlap}
				/>
			</g>,
		);
	}

	const renderCell = function (rowIndex, tabletIndex) {
		// position the cell's svg path
		const xOffset = (tabletIndex + weftOverlap) * unitWidth;
		const yOffset = ((numberOfRows - rowIndex - 1) * (unitHeight / 2));
		const transform = `translate(${xOffset} ${yOffset})`;

		return (
			<g key={`prevew-cell-${rowIndex}-${tabletIndex}`} transform={transform}>
				<PreviewSVG
					pattern={pattern}
					picksByTablet={picksByTablet}
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			</g>
		);
	};

	const renderRowNumber = function (rowIndex) {
		const xOffset = (numberOfTablets + weftOverlap) * cellWidth;
		const yOffset = ((numberOfRows - rowIndex + 0.5) * (cellHeight / 2));

		return (
			<span key={`row-number${rowIndex}`} style={{ 'left': xOffset, 'top': yOffset }}>{rowIndex + 1}</span>
		);
	};

	const rows = []; // svg elements for picks
	const rowNumberElms = []; // html elements

	const rowNumbers = (
		<div className="row-numbers" style={rowNumbersStyle}>
			{rowNumberElms}
		</div>
	);

	for (let i = 0; i < numberOfRows; i += 1) {
		const cells = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			cells.push(renderCell(numberOfRows - i - 1, j));
		}

		rows.push(cells);

		// show row numbers at the point where the pattern is likely to return to home position or repeat
		// and last row to show number of rows
		// row numbers are not part of svg, because they are not shown in pattern summary
		if (modulus(i + 1, holes) === 0 || i === numberOfRows - 1) {
			rowNumberElms.push(renderRowNumber(i));
		}
	}

	// total turns
	const totalTurnCells = [];

	for (let j = 0; j < numberOfTablets; j += 1) {
		const { totalTurns } = picksByTablet[j][numberOfRows - 1];
		const startPosition = modulus(totalTurns, holes) === 0; // tablet is back at start position
		let title = `Tablet number ${j + 1}. Total turns: ${totalTurns}`;
		if (startPosition) {
			title = `Tablet number ${j + 1} is at start position. Total turns: ${totalTurns}.`;
		}

		if (totalTurns === 0) {
			title = `Tablet number ${j + 1} is twist neutral. Total turns: ${totalTurns}.`;
		}

		totalTurnCells.push(
			<span
				className={`${totalTurns === 0 ? 'twist-neutral' : ''} ${startPosition ? 'start-position' : ''}`}
				key={`preview-total-turns-${j}`}
				title={title}
			>
				{totalTurns}
			</span>,
		);
	}

	const totalTurnsDisplay = (
		<span className="total-turns" style={totalTurnsDisplayStyle}>
			{totalTurnCells}
		</span>
	);

	// tablet labels
	const tabletLabelCells = [];

	for (let j = 0; j < numberOfTablets; j += 1) {
		tabletLabelCells.push(
			<span
				key={`preview-tablet-${j}`}
				title={`tablet ${j + 1}`}
			>
				{j + 1}
			</span>,
		);
	}

	const tabletLabels = (
		<span className="tablet-labels" style={tabletLabelsStyle}>
			{tabletLabelCells}
		</span>
	);

	return (
		<div className={`pattern-preview ${previewOrientation}`} style={previewStyle}>
			<div className="preview-wrapper" style={wrapperStyle}>
				{totalTurnsDisplay}
				{rowNumbers}
				<div className="preview-holder" style={holderStyle}>
					<svg viewBox={viewBox} shapeRendering="geometricPrecision" width={imageWidth}>
						{wefts}
						{rows}
					</svg>
				</div>
				{tabletLabels}
			</div>
		</div>
	);
}

PatternPreview.propTypes = {
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};
