import React from 'react';
import PropTypes from 'prop-types';

import './PatternPreview.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

export default function PatternPreview(props) {
	const {
		'pattern': {
			numberOfRows,
			numberOfTablets,
			'patternDesign': { weavingInstructions },
		},
	} = props;

	const unitWidth = 41.560534;
	const unitHeight = 113.08752;

	const cellHeight = 54;
	const cellWidth = 20;

	const numberOfRepeats = 1;
	const viewboxWidth = numberOfRows * unitWidth;
	const viewboxHeight = unitHeight * ((numberOfRows + 1) / 2);
	const viewBox = `0 0 ${viewboxWidth} ${viewboxHeight}`;

	const rowNumberAllocation = 2;
	const imageHeight = (1 + numberOfRows) * (cellHeight / 2);
	// const imageHeight = (1 + numberOfRows) * (cellHeight / 2);
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
		const xOffset = (tabletIndex) * unitWidth;
		const yOffset = ((numberOfRows - rowIndex - 1) * (unitHeight / 2));
		const transform = `translate(${xOffset} ${yOffset})`;
		return (
			<g key={`prevew-cell-${rowIndex}-${tabletIndex}`} transform={transform}><path d="m0.51 111.54 40.545-55v-55l-40.545 55z" stroke="#444" strokeWidth="1.015" fill="{{color}}" /></g>
		);
	};

	const renderRow = function (row, rowIndex) {
		const rowLabel = numberOfRows - rowIndex;

		return (
			<g key={`prevew-cell-${rowIndex}`}>
				{row.map((obj, tabletIndex) => renderCell(rowLabel - 1, tabletIndex))}
			</g>
		);
	};

	return (
		<div className="pattern-preview">

			Pattern preview
			<div className="preview-holder" style={rotationCorrection}>
				<svg viewBox={viewBox} shapeRendering="geometricPrecision" width={totalWidth}>
					{
						weavingInstructions.map((row, index) => (
							renderRow(row, index)
						))
					}
				</svg>
			</div>
		</div>
	);
}

PatternPreview.propTypes = {
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};
