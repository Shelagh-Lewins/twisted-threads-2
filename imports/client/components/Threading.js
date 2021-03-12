import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import {
	addTablets,
	editIncludeInTwist,
	editOrientation,
	editThreadingCell,
	removeTablet,
	setIsEditingThreading,
} from '../modules/pattern';
import ThreadingChartCell from './ThreadingChartCell';
import IncludeInTwistCell from './IncludeInTwistCell';
import OrientationCell from './OrientationCell';
import AddTabletsForm from '../forms/AddTabletsForm';
import './Threading.scss';
import { DEFAULT_PALETTE_COLOR, HOLE_LABELS } from '../../modules/parameters';
import Palette from './Palette';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the threading cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class Threading extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'controlsOffset': 0,
			'isEditing': false,
			'selectedColorIndex': DEFAULT_PALETTE_COLOR,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleChangeIncludInTwistCheckbox',
			'handleClickOrientation',
			'handleClickRemoveTablet',
			'handleSubmitAddTablets',
			'selectColor',
			'toggleEditThreading',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		// ref to find nodes so we can keep controls in view
		this.threadingRef = React.createRef();
		this.controlsRef = React.createRef();
	}

	componentWillUnmount() {
		document.removeEventListener('scroll', this.trackScrolling);
		window.removeEventListener('resize', this.trackScrolling);
	}

	// ensure the edit tools remain in view
	trackScrolling = () => {
		const threadingElm = this.threadingRef.current;

		const {
			'x': threadingLeftOffset,
		} = threadingElm.getBoundingClientRect();

		// find the containing element's applied styles
		const compStyles = window.getComputedStyle(threadingElm);

		const threadingWidth = parseFloat(threadingElm.clientWidth)
		- parseFloat(compStyles.getPropertyValue('padding-left'))
		- parseFloat(compStyles.getPropertyValue('padding-right'));

		// usually we can get the palette width from swatches
		let myNode;
		[myNode] = this.controlsRef.current.getElementsByClassName('swatches');

		// but the swatches are hidden when editing color book colors
		if (!myNode) {
			[myNode] = this.controlsRef.current.getElementsByClassName('color-books');
		}

		const controlsWidth = myNode.getBoundingClientRect().width;

		const widthDifference = threadingWidth - controlsWidth;

		if (threadingLeftOffset < 0) {
			this.setState({
				'controlsOffset': Math.min(-1 * threadingLeftOffset, widthDifference),
			});
		} else {
			this.setState({
				'controlsOffset': 0,
			});
		}
	}

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
		});
	}

	handleClickRemoveTablet(tabletIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const response = confirm(`Do you want to delete tablet ${tabletIndex + 1}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeTablet({ _id, 'tablet': tabletIndex }));

			setTimeout(() => this.trackScrolling(), 100); // give the change time to render
		}
	}

	handleSubmitAddTablets(data) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(addTablets({
			_id,
			'insertNTablets': parseInt(data.insertNTablets, 10),
			'insertTabletsAt': parseInt(data.insertTabletsAt - 1, 10),
			'colorIndex': parseInt(selectedColorIndex, 10),
		}));

		setTimeout(() => this.trackScrolling(), 100); // give the change time to render
	}

	handleClickThreadingCell(rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editThreadingCell({
			_id,
			'hole': rowIndex,
			'tablet': tabletIndex,
			'colorIndex': selectedColorIndex,
		}));
	}

	handleChangeIncludInTwistCheckbox(event, tabletIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		dispatch(editIncludeInTwist({
			_id,
			'tablet': tabletIndex,
		}));
	}

	handleClickOrientation(tabletIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		dispatch(editOrientation({
			_id,
			'tablet': tabletIndex,
		}));
	}

	toggleEditThreading() {
		const { dispatch } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			document.addEventListener('scroll', this.trackScrolling);
			window.addEventListener('resize', this.trackScrolling);
		} else {
			document.removeEventListener('scroll', this.trackScrolling);
			window.removeEventListener('resize', this.trackScrolling);
		}

		this.setState({
			'controlsOffset': 0,
			'isEditing': !isEditing,
		});

		dispatch(setIsEditingThreading(!isEditing));
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditThreading}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditThreading}>Edit threading chart</Button>}
			</div>
		);
	}

	renderCell(rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		return (
			<span
				type={isEditing ? 'button' : undefined}
				onClick={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
				onKeyPress={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
				role={isEditing ? 'button' : undefined}
				tabIndex={isEditing ? '0' : undefined}
			>
				<ThreadingChartCell
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
			</span>
		);
	}

	renderRow(rowIndex) {
		const { holes, numberOfTablets } = this.props;
		const labelIndex = holes - rowIndex - 1;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(
				<li
					className="cell value"
					key={`threading-cell-${rowIndex}-${i}`}
				>
					{this.renderCell(rowIndex, i)}
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
	}

	renderIncludeInTwistCalculationsButton(tabletIndex) {
		const { isEditing } = this.state;

		return (
			<IncludeInTwistCell
				handleChangeIncludInTwistCheckbox={this.handleChangeIncludInTwistCheckbox}
				isEditing={isEditing}
				tabletIndex={tabletIndex}
			/>
		);
	}

	renderIncludeInTwistCalculationsButtons() {
		const {
			'pattern': { includeInTwist, patternType },
			numberOfTablets,
		} = this.props;

		// 'freehand' patterns do not calculate twist
		if (!includeInTwist || patternType === 'freehand') {
			return;
		}

		const buttons = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			buttons.push(
				<li
					className="cell label"
					key={`include-in-twist-${i}`}
				>
					{this.renderIncludeInTwistCalculationsButton(i)}
				</li>,
			);
		}

		return (
			<div className="include-in-twist-buttons">
				<ul>
					{buttons}
				</ul>
			</div>
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
		const { holes } = this.props;
		const rows = [];
		for (let i = 0; i < holes; i += 1) {
			rows.push(
				<li
					className="row"
					key={`threading-row-${i}`}
				>
					{this.renderRow(i)}
				</li>,
			);
		}

		return (
			<>
				{this.renderTabletLabels()}
				{this.renderIncludeInTwistCalculationsButtons()}
				<ul className="threading-chart">
					{rows}
				</ul>
			</>
		);
	}

	renderRemoveTabletButton(tabletIndex) {
		return (
			<span
				type="button"
				onClick={() => this.handleClickRemoveTablet(tabletIndex)}
				onKeyPress={() => this.handleClickRemoveTablet(tabletIndex)}
				role="button"
				tabIndex="0"
				title={`Delete tablet ${tabletIndex + 1}`}
			>
			X
			</span>
		);
	}

	renderRemoveTabletButtons() {
		const { numberOfTablets } = this.props;
		const buttons = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			buttons.push(
				<li
					className="cell delete"
					key={`orientation-${i}`}
				>
					{this.renderRemoveTabletButton(i)}
				</li>,
			);
		}

		return (
			<div className="remove-tablet-buttons">
				<ul className="remove-tablet-buttons">
					{buttons}
				</ul>
				<p className="hint">Slope of line = angle of tablet viewed from above</p>
			</div>
		);
	}

	renderOrientation(tabletIndex) {
		const { 'pattern': { patternType } } = this.props;
		const { isEditing } = this.state;
		const canChange = patternType !== 'brokenTwill' && patternType !== 'doubleFaced';

		return (
			<OrientationCell
				handleClickOrientation={canChange ? this.handleClickOrientation : undefined}
				isEditing={isEditing}
				tabletIndex={tabletIndex}
			/>
		);
	}

	renderOrientations() {
		const { numberOfTablets } = this.props;
		const orientations = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			orientations.push(
				<li
					className="cell value"
					key={`orientation-${i}`}
				>
					{this.renderOrientation(i)}
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
	}

	renderToolbar() {
		const { numberOfTablets } = this.props;

		return (
			<AddTabletsForm
				handleSubmit={this.handleSubmitAddTablets}
				numberOfTablets={numberOfTablets}
				enableReinitialize={true}
			/>
		);
	}

	renderPalette() {
		const {
			colorBooks,
			'pattern': { _id },
		} = this.props;
		const { selectedColorIndex } = this.state;

		return (
			<Palette
				_id={_id}
				colorBooks={colorBooks}
				elementId="threading-palette"
				selectColor={this.selectColor}
				initialColorIndex={selectedColorIndex}
			/>
		);
	}

	render() {
		const { canEdit } = this.props;
		const { controlsOffset, isEditing } = this.state;

		return (
			<div
				className={`threading ${isEditing ? 'editing' : ''}`}
			>
				{canEdit && this.renderControls()}
				<div
					className="content"
					ref={this.threadingRef}
				>
					{this.renderChart()}
					{isEditing && this.renderRemoveTabletButtons()}
					{this.renderOrientations()}
					<div
						ref={this.controlsRef}
						style={{
							'left': `${controlsOffset}px`,
							'position': 'relative',
						}}
					>
						{isEditing && this.renderToolbar()}
						{isEditing && this.renderPalette()}
					</div>
					<div className="clearing" />
				</div>
			</div>
		);
	}
}

Threading.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'holes': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Threading;
