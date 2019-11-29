import React from 'react';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';
import { modulus } from '../modules/weavingUtils';

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
			orientations,
		},
		picksByTablet,
	} = props;

	const unitWidth = 41.560534;
	const unitHeight = 113.08752;

	const cellHeight = 54;
	const cellWidth = 20;

	const numberOfRepeats = 1; // TODO calculate and repeat
	const viewboxWidth = numberOfTablets * unitWidth;
	const viewboxHeight = unitHeight * ((numberOfRows + 1) / 2);
	const viewBox = `0 0 ${viewboxWidth} ${viewboxHeight}`;

	const rowNumberAllocation = 0; // TO DO show row numbers
	const imageHeight = (1 + numberOfRows) * (cellHeight / 2);
	const totalWidth = cellWidth * (numberOfTablets + rowNumberAllocation);

	// elements overlap by half their height
	// so total height is half their height * number of rows
	// plus another half height that sticks out the top
	const totalHeight = imageHeight * numberOfRepeats;
	const rotationCorrection = {
		'height': `${totalHeight}px`,
		'width': `${totalWidth}px`,
		'position': 'relative',
	};

	// /////////////
	const renderCell = function (rowIndex, tabletIndex) {
		// position the cell's svg path
		const xOffset = (tabletIndex) * unitWidth;
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

	const rows = [];

	for (let i = 0; i < numberOfRows; i += 1) {
		const cells = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			cells.push(renderCell(numberOfRows - i - 1, j));
		}
		rows.push(cells);
	}

	return (
		<div className="pattern-preview">
			Pattern preview
			<div className="preview-holder" style={rotationCorrection}>
				<svg viewBox={viewBox} shapeRendering="geometricPrecision" width={totalWidth}>
					{rows}
				</svg>
			</div>
		</div>
	);
}

PatternPreview.propTypes = {
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};
