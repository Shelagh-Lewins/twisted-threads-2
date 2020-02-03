import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import PropTypes from 'prop-types';
import {
	setIsEditingWeaving,
} from '../modules/pattern';
import './WeavingDesignBrokenTwill.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingDesignBrokenTwill extends PureComponent {
	constructor(props) {
		super(props);

		const {
			pattern,
		} = props;

		const {
			'patternDesign': {
				twillPatternChart,
			},
		} = pattern;

		this.state = {
			'isEditing': false,
			'editMode': 'color',
			'numberOfChartRows': twillPatternChart.length,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'toggleEditWeaving',
			'handleClickEditMode',
			'handleClickRemoveRow',
			'handleClickWeavingCell',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		// ref to find nodes so we can keep controls in view
		this.weavingRef = React.createRef();
		this.controlsRef = React.createRef();
	}

	componentWillUnmount() {
		document.removeEventListener('scroll', this.trackScrolling);
		window.removeEventListener('resize', this.trackScrolling);
	}

	// ensure the edit tools remain in view
	trackScrolling = () => {
		const weavingElm = this.weavingRef.current;
		const constrolsElm = this.controlsRef.current;

		const {
			'x': weavingPositionX,
			'y': weavingPositionY,
		} = weavingElm.getBoundingClientRect();

		// find the containing element's applied styles
		const weavingCompStyles = window.getComputedStyle(weavingElm);


		const controlsCompStyles = window.getComputedStyle(constrolsElm);

		const weavingWidth = parseFloat(weavingElm.clientWidth)
		- parseFloat(weavingCompStyles.getPropertyValue('padding-left'))
		- parseFloat(weavingCompStyles.getPropertyValue('padding-right'));

		const weavingHeight = parseFloat(weavingElm.clientHeight)
		- parseFloat(weavingCompStyles.getPropertyValue('padding-top'))
		- parseFloat(weavingCompStyles.getPropertyValue('padding-bottom'));

		const windowHeight = window.innerHeight;
		const controlsPaddingY = parseFloat(controlsCompStyles.getPropertyValue('padding-top')) + parseFloat(controlsCompStyles.getPropertyValue('padding-bottom'));
		const weavingLeftOffset = weavingPositionX;
		const weavingBottomOffset = weavingHeight + weavingPositionY - windowHeight + controlsPaddingY + 16; // extra bit to raise panel above bottom of window

		const controlsWidth = constrolsElm.getBoundingClientRect().width;

		const controlsHeight = constrolsElm.getBoundingClientRect().height;

		const widthDifference = weavingWidth - controlsWidth;

		const heightDifference = weavingHeight - controlsHeight;

		let offsetX = 0;
		let offsetY = 0;

		if (weavingLeftOffset < 0) {
			offsetX = Math.min(-1 * weavingLeftOffset, widthDifference);
		}

		if (weavingBottomOffset > 0) {
			offsetY = Math.min(weavingBottomOffset, heightDifference);
		}

		this.setState({
			'controlsOffsetX': offsetX,
			'controlsOffsetY': offsetY,
		});
	}

	handleClickWeavingCell(rowIndex, tabletIndex) {
		const {
			dispatch,
			'pattern': { _id },
			// twillPatternChart,
		} = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		console.log('rowIndex', rowIndex);
		console.log('tabletIndex', tabletIndex);
	}

	handleClickRemoveRow(rowIndex) {
		const {
			dispatch,
			'pattern': { _id },
		} = this.props;

		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const rowFirst = (rowIndex * 2) + 1;

		const response = confirm(`Do you want to delete rows ${rowFirst} and ${rowFirst + 1}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			/* dispatch(removeWeavingRows({
				_id,
				'removeNRows': 1,
				'removeRowsAt': rowIndex,
			}));
			setTimeout(() => this.trackScrolling(), 100); // give time for the deleted rows to be removed */
		}
	}

	toggleEditWeaving() {
		const { dispatch } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			document.addEventListener('scroll', this.trackScrolling);
			window.addEventListener('resize', this.trackScrolling);
			setTimeout(() => this.trackScrolling(), 100); // give the controls time to render
		} else {
			document.removeEventListener('scroll', this.trackScrolling);
			window.removeEventListener('resize', this.trackScrolling);
		}

		this.setState({
			'isEditing': !isEditing,
		});

		dispatch(setIsEditingWeaving(!isEditing));
	}

	handleClickEditMode(event) {
		const newEditMode = event.target.value;

		this.setState({
			'editMode': newEditMode,
		});
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditWeaving}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditWeaving}>Edit weaving design</Button>}
			</div>
		);
	}

	renderCell(rowIndex, tabletIndex) {
		const {
			'pattern': {
				'patternDesign': {
					twillChangeChart,
					twillPatternChart,
				},
			},
		} = this.props;

		const {
			isEditing,
			numberOfChartRows,
		} = this.state;

		// ensure visible cells and delete row buttons are focusable
		let tabIndex;

		if (isEditing) {
			if (rowIndex !== numberOfChartRows - 1 || tabletIndex % 2 === 1) {
				tabIndex = 0;
			}
		}

		const isForeground = twillPatternChart[rowIndex][tabletIndex] === 'X';
		const isDirectionChange = twillChangeChart[rowIndex][tabletIndex] === 'X';

		return (
			<li
				className={`cell value ${tabletIndex === 0 ? 'first-tablet' : ''} ${isForeground ? 'foreground' : ''} ${isDirectionChange ? 'direction-change' : ''}`}
				key={`twill-design-cell-${rowIndex}-${tabletIndex}`}
			>
				<span
					type={isEditing ? 'button' : undefined}
					onClick={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					onKeyPress={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					role={isEditing ? 'button' : undefined}
					tabIndex={tabIndex}
				/>
			</li>
		);
	}

	renderRow(rowIndex) {
		const {
			numberOfTablets,
		} = this.props;

		const {
			numberOfChartRows,
		} = this.state;

		const { isEditing } = this.state;
		const rowLabel = numberOfChartRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(this.renderCell(rowLabel - 1, i));
		}

		return (
			<>
				<ul className={`${rowIndex === 0 ? 'last-row' : ''} ${(rowIndex === numberOfChartRows - 1) ? 'first-row' : ''}`}>
					<li className="row-label even"><span>{rowLabel * 2}</span></li>
					<li className="row-label odd"><span>{(rowLabel * 2) - 1}</span></li>
					{cells}
					{isEditing && numberOfChartRows > 2 && rowIndex !== 0 && (
						<li className="delete">
							<span
								title={`delete row ${rowLabel}`}
								type="button"
								onClick={() => this.handleClickRemoveRow(rowLabel - 1)}
								onKeyPress={() => this.handleClickRemoveRow(rowLabel - 1)}
								role="button"
								tabIndex="0"
							>
							X
							</span>
						</li>
					)}
				</ul>
			</>
		);
	}

	renderTabletLabels() {
		const {
			numberOfTablets,
		} = this.props;

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
			numberOfChartRows,
		} = this.state;

		const { isEditing } = this.state;

		const rows = [];
		for (let i = 0; i < numberOfChartRows; i += 1) {
			rows.push(
				<li
					className="weaving-design-row"
					key={`weaving-design-row-${i}`}
				>
					{this.renderRow(i)}
				</li>,
			);
		}

		return (
			<>
				{isEditing && (
					<>
						<p>Change the twill direction to create smooth diagonal lines.</p>
					</>
				)}
				{this.renderTabletLabels()}
				<ul className="weaving-chart">
					{rows}
				</ul>
			</>
		);
	}

	renderEditOptions() {
		const { editMode } = this.state;
		const options = [
			{
				'name': 'Edit colour',
				'value': 'color',
			},
			{
				'name': 'Edit twill direction',
				'value': 'twillDirection',
			},
		];

		return (
			<>
				<ButtonToolbar>
					<ButtonGroup className="edit-mode">
						{options.map((option) => (
							<Button
								className={editMode === option.value ? 'selected' : ''}
								color="secondary"
								key={option.value}
								onClick={this.handleClickEditMode}
								value={option.value}
							>
								{option.name}
							</Button>
						))}
					</ButtonGroup>
				</ButtonToolbar>
			</>
		);
	}

	renderToolbar() {
		const {
			numberOfRows,
		} = this.props;
		const {
			controlsOffsetX,
			controlsOffsetY,
			editMode,
			numberOfTurns,
		} = this.state;

		let rowIndex;
		let tabletIndex;

		return (
			<div
				className={`weaving-toolbar ${controlsOffsetY > 0 ? 'scrolling' : ''}`}
				ref={this.controlsRef}
				style={{
					'left': `${controlsOffsetX}px`,
					'bottom': `${controlsOffsetY}px`,
					'position': 'relative',
				}}
			>
				{this.renderEditOptions()}
			</div>
		);
	}

	render() {
		const { 'pattern': { createdBy } } = this.props;
		const { isEditing } = this.state;
		const canEdit = createdBy === Meteor.userId();

		return (
			<div className={`weaving-design-twill ${isEditing ? 'editing' : ''}`}>
				{canEdit && this.renderControls()}
				<div
					className="content"
					ref={this.weavingRef}
				>
					{this.renderChart()}
					{isEditing && this.renderToolbar()}
					<div className="clearing" />
				</div>
			</div>
		);
	}
}

WeavingDesignBrokenTwill.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WeavingDesignBrokenTwill;
