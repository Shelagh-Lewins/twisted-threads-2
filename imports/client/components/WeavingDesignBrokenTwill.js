import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
	addWeavingRows,
	editTwillChart,
	setIsEditingWeaving,
} from '../modules/pattern';
import calculateScrolling from '../modules/calculateScrolling';
import AddRowsForm from '../forms/AddRowsForm';
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

		this.state = {
			'isEditing': false,
			'editMode': 'color',
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleSubmitAddRows',
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
		const { controlsOffsetX, controlsOffsetY } = calculateScrolling({
			'controlsElm': this.controlsRef.current,
			'weavingElm': this.weavingRef.current,
		});

		this.setState({
			controlsOffsetX,
			controlsOffsetY,
		});
	}

	handleClickWeavingCell(rowIndex, tabletIndex) {
		const {
			dispatch,
			'pattern': { _id },
		} = this.props;
		const { editMode, isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		dispatch(editTwillChart({
			_id,
			rowIndex,
			tabletIndex,
			'twillChart': editMode === 'color' ? 'twillPatternChart' : 'twillDirectionChangeChart',
		}));
	}

	handleSubmitAddRows(data) {
		const { dispatch, 'pattern': { _id } } = this.props;
		console.log('add rows', data);

		dispatch(addWeavingRows({
			_id,
			'insertNRows': parseInt(data.insertNRows, 10),
			'insertRowsAt': parseInt(data.insertRowsAt - 1, 10),
		}));

		setTimeout(() => this.trackScrolling(), 100); // give the new rows time to render
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
			'patternDesign': {
				twillDirectionChangeChart,
				twillPatternChart,
			},
		} = this.props;
		const numberOfChartRows = twillPatternChart.length;

		const {
			isEditing,
		} = this.state;

		// ensure visible cells and delete row buttons are focusable
		let tabIndex;

		if (isEditing) {
			if (rowIndex !== numberOfChartRows - 1 || tabletIndex % 2 === 1) {
				tabIndex = 0;
			}
		}

		const isForeground = twillPatternChart[rowIndex][tabletIndex] === 'X';
		const isDirectionChange = twillDirectionChangeChart[rowIndex][tabletIndex] === 'X';

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
			'patternDesign': {
				twillPatternChart,
			},
		} = this.props;
		const numberOfChartRows = twillPatternChart.length;
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
			'patternDesign': {
				twillPatternChart,
			},
		} = this.props;
		const numberOfChartRows = twillPatternChart.length;
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
				<AddRowsForm
					enableReinitialize={true}
					handleSubmit={this.handleSubmitAddRows}
					numberOfRows={numberOfRows}
					patternType="brokenTwill"
				/>
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
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired, // updated in state
};

function mapStateToProps(state) {
	return {
		'patternDesign': state.pattern.patternDesign,
	};
}

export default connect(mapStateToProps)(WeavingDesignBrokenTwill);
