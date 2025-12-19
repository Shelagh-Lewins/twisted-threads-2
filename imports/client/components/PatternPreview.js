// pattern preview as displayed in pattern detail page
// with labels and can be rotated

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Roles } from 'meteor/roles';
import PreviewCell from './PreviewCell';
import FreehandPreviewCell from './FreehandPreviewCell';
import {
	getIncludeInTwist,
	getPalette,
	getPreviewShouldUpdate,
} from '../modules/pattern';
import { getNumberOfRepeats, modulus } from '../modules/weavingUtils';
import { PathWeft } from '../modules/previewPaths';
import { savePatternPreview } from '../modules/patternPreview';
import '../constants/globals';
import './PatternPreview.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class PatternPreview extends Component {
	constructor(props) {
		super(props);

		// bind onClick functions to provide context
		const functionsToBind = ['savePreviewPattern'];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	shouldComponentUpdate(nextProps) {
		const { componentShouldUpdate } = nextProps;

		return componentShouldUpdate;
	}

	componentDidUpdate() {
		// the stored preview is updated prior to unmount
		// so it doesn't need to be written immediately while editing
		// this save is a guard in case network failure etc prevents clean unmount
		clearTimeout(this.savePatternPreviewTimeout);
		this.savePatternPreviewTimeout = setTimeout(() => {
			this.savePreviewPattern();
		}, 3000);
	}

	componentWillUnmount() {
		this.savePreviewPattern();
	}

	savePreviewPattern() {
		const {
			dispatch,
			pattern: { _id, createdBy },
			printView,
			showBackOfBand,
		} = this.props;

		const canSave =
			!printView &&
			(createdBy === Meteor.userId() ||
				Roles.getRolesForUser(Meteor.userId()).includes('serviceUser'));
		if (!canSave) return;

		const holder = document.getElementById('preview-holder');

		if (holder) {
			// wait for render
			const elm = document
				.getElementById('preview-holder')
				.getElementsByTagName('svg')[0];

			if (elm && !showBackOfBand) {
				dispatch(savePatternPreview({ _id, elm }));
			}
		}
	}

	render() {
		const {
			holes,
			includeInTwist,
			numberOfRows,
			numberOfTablets,
			patternWillRepeat,
			palette,
			pattern: {
				patternType,
				previewOrientation: patternPreviewOrientation,
				weftColor,
			},
			printView,
			rowsAtStartPosition,
			showBackOfBand,
			showStartPosition,
			totalTurnsByTablet,
		} = this.props;

		// wait until the pattern details have loaded
		if (typeof weftColor === 'undefined') {
			return null;
		}

		// in print view, always show preview 'up' to ensure it does not scroll
		const previewOrientation = printView ? 'up' : patternPreviewOrientation;

		// ///////////////////////////
		// calculate sizes and rotations
		// how many repeats to show
		let numberOfRepeats = 1;

		if (patternWillRepeat) {
			numberOfRepeats = getNumberOfRepeats(numberOfRows);
		}

		// pick graphic size in the SVG
		// if the size are not whole numbers, there is a cumulative error which becomes an issue in large patterns
		const unitWidth = 42;
		const unitHeight = 113;

		// screen pixel size of pick graphic, used to calculate final size of preview holder
		const cellHeight = 54;
		const cellWidth = 20;
		const weftOverlap = 0.2; // how much the weft sticks out each side

		// size of svg viewbox and parent element
		const widthInUnits = numberOfTablets + weftOverlap * 2;
		const heightInUnits = numberOfRows / 2;

		// elements overlap by half their height
		// so total height is half their height * number of rows
		// plus another half height that sticks out the top

		// to avoid the page jumping while the user is editing weaving, repeats are only shown if the preview is horizontal

		const hideRepeats = previewOrientation === 'up';

		const getBoundingBox = (pickHeight, pickWidth, hideRepeatsLocal) => {
			let height =
				pickHeight * heightInUnits * numberOfRepeats + pickHeight / 2;

			if (hideRepeatsLocal) {
				height = pickHeight * heightInUnits + pickHeight / 2;
			}

			return {
				height,
				width: pickWidth * widthInUnits,
			};
		};

		// size the svg viewbox
		const { height: viewboxHeight, width: viewboxWidth } = getBoundingBox(
			unitHeight,
			unitWidth,
		);

		const viewBox = `0 0 ${viewboxWidth} ${viewboxHeight}`;

		// size the container element
		const { height: imageHeight, width: imageWidth } = getBoundingBox(
			cellHeight,
			cellWidth,
			hideRepeats,
		);

		let previewStyle = {};
		let holderStyle = {};
		let wrapperStyle = {};
		let tabletLabelsStyle = {};
		let totalTurnsDisplayStyle = {};
		let rowNumbersStyle = {};
		let rowAtStartPositionStyle = {};
		const tabletLabelsAllowance = 60; // allow for labels which aren't part of the svg
		const rowLabelsAllowance = 60;
		const tabletLabelsOffset = 15; // push the labels to the side
		const adjustedHeight = imageHeight + tabletLabelsAllowance;
		const adjustedWidth = imageWidth + rowLabelsAllowance;
		const rowNumbersAllowance = cellWidth * 1.5;
		const horizontalScale = 0.7; // scale the preview when horizontal for better page fit

		// corrections for rotation
		switch (previewOrientation) {
			case 'up':
				holderStyle = {
					height: `${imageHeight}px`,
					width: `${imageWidth}px`,
				};
				wrapperStyle = {
					width: `${imageWidth}px`,
				};
				break;

			case 'left':
				previewStyle = {
					height: `${adjustedWidth * horizontalScale}px`,
					width: `${adjustedHeight}px`,
				};
				holderStyle = {
					height: `${imageWidth}px`,
					width: `${imageHeight}px`,
				};
				wrapperStyle = {
					msTransform: `scale(${horizontalScale}) translate(0, ${
						imageWidth + rowNumbersAllowance
					}px) rotate(-90deg)`,
					WebkitTransform: `scale(${horizontalScale}) translate(0, ${
						imageWidth + rowNumbersAllowance
					}px)rotate(-90deg)`,
					transform: `scale(${horizontalScale}) translate(0, ${
						imageWidth + rowNumbersAllowance
					}px)rotate(-90deg)`,
					transformOrigin: 'top left',
					width: `${imageWidth}px`,
				};
				tabletLabelsStyle = {
					top: `${imageHeight - imageWidth + tabletLabelsOffset}px`,
				};
				break;

			case 'right':
				previewStyle = {
					height: `${adjustedWidth * horizontalScale}px`, // scale parent when preview scaled
					width: `${adjustedHeight}px`,
				};
				holderStyle = {
					height: `${imageWidth}px`,
					width: `${imageHeight}px`,
					transform: `translate(0, -${tabletLabelsOffset}px)`,
				};
				wrapperStyle = {
					msTransform: `scale(${horizontalScale}) translate(${
						imageHeight + rowNumbersAllowance
					}px, 0) rotate(90deg)`,
					WebkitTransform: `scale(${horizontalScale}) translate(${
						imageHeight + rowNumbersAllowance
					}px, 0) rotate(90deg)`,
					transform: `scale(${horizontalScale}) translate(${
						imageHeight + rowNumbersAllowance
					}px, 0) rotate(90deg)`,
					transformOrigin: 'top left',
					width: `${imageWidth}px`,
				};
				tabletLabelsStyle = {
					top: `${imageHeight - imageWidth - tabletLabelsOffset}px`,
				};
				totalTurnsDisplayStyle = {
					transform: `translate(0, -${tabletLabelsOffset}px)`,
				};
				rowNumbersStyle = {
					transform: `translate(0, -${tabletLabelsOffset}px)`,
				};
				rowAtStartPositionStyle = {
					transform: `translate(0, -${tabletLabelsOffset}px)`,
				};
				break;

			default:
				break;
		}

		// /////////////
		// render the preview
		// reverse order of tablets if showing back of band
		const findTabletIndex = (index) =>
			showBackOfBand ? numberOfTablets - index - 1 : index;

		const yOffsetForRow = (rowIndex, repeatOffset) =>
			(numberOfRows - rowIndex - 1) * (unitHeight / 2) + repeatOffset;

		const renderCell = function (
			currentRepeat,
			repeatOffset,
			rowIndex,
			tabletIndex,
		) {
			// position the cell's svg path
			const xOffset = (findTabletIndex(tabletIndex) + weftOverlap) * unitWidth; // take account of whether we are viewing the front or the back of the band
			const yOffset = yOffsetForRow(rowIndex, repeatOffset);
			const transform = `translate(${xOffset} ${yOffset})`;

			let cell;

			if (patternType === 'freehand') {
				cell = (
					<FreehandPreviewCell
						rowIndex={rowIndex}
						tabletIndex={tabletIndex}
					/>
				);
			} else {
				cell = (
					<PreviewCell
						currentRepeat={currentRepeat}
						numberOfRepeats={numberOfRepeats}
						numberOfRows={numberOfRows}
						patternWillRepeat={patternWillRepeat}
						patternType={patternType}
						rowIndex={rowIndex}
						showBackOfBand={showBackOfBand}
						tabletIndex={tabletIndex}
					/>
				);
			}

			return (
				<g
					key={`prevew-cell-${rowIndex}-${tabletIndex}`}
					transform={transform}
					className={currentRepeat !== 1 ? 'repeat' : ''}
				>
					{cell}
				</g>
			);
		};

		const renderRowNumber = function (currentRepeat, repeatOffset, rowIndex) {
			const xOffset = (numberOfTablets + weftOverlap) * cellWidth;
			const yOffset =
				(numberOfRows - rowIndex + 0.5) * (cellHeight / 2) + repeatOffset;

			return (
				<span
					key={`row-number-${rowIndex + currentRepeat * numberOfRows}`}
					style={{ left: xOffset, top: yOffset }}
				>
					{rowIndex + 1}
				</span>
			);
		};

		const wefts = [];
		const rows = []; // svg elements for picks
		const rowNumberElms = []; // html elements
		const rowNumbers = (
			<div
				className='row-numbers'
				style={rowNumbersStyle}
			>
				{rowNumberElms}
			</div>
		);

		// indicate rows that are at start position
		const renderRowAtStartPositionElm = function (
			currentRepeat,
			repeatOffset,
			rowIndex,
		) {
			const xOffset = 0;
			const yOffset =
				(numberOfRows - rowIndex + 0.75) * (cellHeight / 2) + repeatOffset;
			// const yOffset = (numberOfRows - rowIndex + 0.5) * (cellHeight / 2) + repeatOffset;

			return (
				<span
					key={`row-at-start-position-${
						rowIndex + currentRepeat * numberOfRows
					}`}
					style={{ left: xOffset, top: yOffset }}
				>
					<span>
						<span>{`${rowIndex + 1} start position`}</span>
					</span>
				</span>
			);
		};

		const rowAtStartPositionElms = [];
		const rowAtStartPositionParent = (
			<div
				className='row-at-start-position'
				style={rowAtStartPositionStyle}
			>
				{rowAtStartPositionElms}
			</div>
		);

		// for each pattern repeat
		for (
			let currentRepeat = 1;
			currentRepeat <= numberOfRepeats;
			currentRepeat += 1
		) {
			// offset pattern repeats by half the pick height per row
			const getOffset = (pickHeight) =>
				(currentRepeat - 1) * pickHeight * (numberOfRows / 2);

			const svgRepeatOffset = getOffset(unitHeight);
			const elmRepeatOffset = getOffset(cellHeight);

			// for each row
			for (let i = 0; i < numberOfRows; i += 1) {
				// draw the weft
				const xOffset = 0;
				const yOffset = yOffsetForRow(i, svgRepeatOffset);
				const transform = `translate(${xOffset} ${yOffset})`;

				wefts.push(
					<g
						key={`preview-weft-${i + currentRepeat * numberOfRows}`}
						transform={transform}
						className={currentRepeat !== 1 ? 'repeat' : ''}
					>
						<PathWeft
							fill={palette[weftColor]}
							scale={numberOfTablets + 2 * weftOverlap}
						/>
					</g>,
				);

				// draw the weaving cells
				const cells = [];

				for (let j = 0; j < numberOfTablets; j += 1) {
					// we do not need to change the order of the tablets depending on whether front or back of band is showing
					// the xOffset will take care of this
					cells.push(
						renderCell(currentRepeat, svgRepeatOffset, numberOfRows - i - 1, j),
					);
				}

				rows.push(cells);

				// show row numbers at the point where all forward turns would bring the tablet home
				// also first and last row for clarity
				// row numbers are not part of svg
				// row numbers are the same on each repeat, to make it clear that the pattern IS repeating
				if (
					modulus(i + 1, holes) === 0 ||
					i === numberOfRows - 1 ||
					i + 1 === 1
				) {
					if (!hideRepeats || currentRepeat === 1) {
						rowNumberElms.push(
							renderRowNumber(currentRepeat, elmRepeatOffset, i),
						);
					}
				}

				// if the row is at the start position, add an indicator
				if (showStartPosition && rowsAtStartPosition.indexOf(i) !== -1) {
					if (!hideRepeats || currentRepeat === 1) {
						rowAtStartPositionElms.push(
							renderRowAtStartPositionElm(currentRepeat, elmRepeatOffset, i),
						);
					}
				}
			}
		}

		// total turns
		const totalTurnCells = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			const tabletIndex = findTabletIndex(j);

			const totalTurns = totalTurnsByTablet[tabletIndex];
			const startPosition = modulus(totalTurns, holes) === 0; // tablet is back at start position
			let title = `Tablet number ${
				tabletIndex + 1
			}. Total turns: ${totalTurns}`;
			if (startPosition) {
				title = `Tablet number ${
					tabletIndex + 1
				} is at start position. Total turns: ${totalTurns}.`;
			}

			if (totalTurns === 0) {
				title = `Tablet number ${
					tabletIndex + 1
				} is twist neutral. Total turns: ${totalTurns}.`;
			}

			totalTurnCells.push(
				<span
					className={`${totalTurns === 0 ? 'twist-neutral' : ''} ${
						startPosition ? 'start-position' : ''
					} ${
						includeInTwist && includeInTwist[tabletIndex] ? '' : 'not-in-twist'
					}`}
					key={`preview-total-turns-${tabletIndex}`}
					title={title}
				>
					{totalTurns}
				</span>,
			);
		}

		let totalTurnsDisplay;

		if (patternType !== 'freehand') {
			totalTurnsDisplay = (
				<span
					className='total-turns'
					style={totalTurnsDisplayStyle}
				>
					{totalTurnCells}
				</span>
			);
		}

		// tablet labels
		const tabletLabelCells = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			const tabletIndex = findTabletIndex(j);

			tabletLabelCells.push(
				<span
					key={`preview-tablet-${tabletIndex}`}
					title={`tablet ${tabletIndex + 1}`}
				>
					{tabletIndex + 1}
				</span>,
			);
		}

		const tabletLabels = (
			<span
				className='tablet-labels'
				style={tabletLabelsStyle}
			>
				{tabletLabelCells}
			</span>
		);

		return (
			<div
				className={`pattern-preview ${previewOrientation}`}
				style={previewStyle}
			>
				<div
					className='preview-wrapper'
					style={wrapperStyle}
				>
					{totalTurnsDisplay}
					{rowAtStartPositionParent}
					{rowNumbers}
					<div
						id='preview-holder'
						className='preview-holder'
						style={holderStyle}
					>
						<svg
							viewBox={viewBox}
							shapeRendering='geometricPrecision'
							width={imageWidth}
						>
							{wefts}
							{rows}
						</svg>
					</div>
					{tabletLabels}
				</div>
			</div>
		);
	}
}

PatternPreview.propTypes = {
	componentShouldUpdate: PropTypes.bool.isRequired,
	dispatch: PropTypes.func.isRequired,
	holes: PropTypes.number.isRequired,
	includeInTwist: PropTypes.arrayOf(PropTypes.any),
	numberOfRows: PropTypes.number.isRequired,
	numberOfTablets: PropTypes.number.isRequired,
	palette: PropTypes.arrayOf(PropTypes.any).isRequired,
	pattern: PropTypes.objectOf(PropTypes.any).isRequired,
	patternWillRepeat: PropTypes.bool.isRequired,
	printView: PropTypes.bool,
	rowsAtStartPosition: PropTypes.arrayOf(PropTypes.any),
	showBackOfBand: PropTypes.bool,
	showStartPosition: PropTypes.bool,
	totalTurnsByTablet: PropTypes.arrayOf(PropTypes.any),
};

function mapStateToProps(state) {
	return {
		componentShouldUpdate: getPreviewShouldUpdate(state),
		includeInTwist: getIncludeInTwist(state),
		palette: getPalette(state),
	};
}

export default connect(mapStateToProps)(PatternPreview);
