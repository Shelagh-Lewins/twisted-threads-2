import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import PropTypes from 'prop-types';
import {
	addWeavingRows,
	editWeavingCellDirection,
	editWeavingCellNumberOfTurns,
	removeWeavingRows,
	setIsEditingWeaving,
} from '../modules/pattern';
import WeavingChartCell from './WeavingChartCell';
import AddRowsForm from '../forms/AddRowsForm';
import EditWeavingCellForm from '../forms/EditWeavingCellForm';
import './Threading.scss';
import './WeavingDesignIndividual.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingDesignIndividual extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'controlsOffsetX': 0,
			'controlsOffsetY': 0,
			'editMode': 'direction',
			'isEditing': false,
			'numberOfTurns': 1,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickEditMode',
			'handleClickRemoveRow',
			'handleClickWeavingCell',
			'handleSubmitAddRows',
			'handleSubmitEditWeavingCellForm',
			'toggleEditWeaving',
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
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing, editMode, numberOfTurns } = this.state;

		if (!isEditing) {
			return;
		}

		if (editMode === 'direction') {
			dispatch(editWeavingCellDirection({
				_id,
				'row': rowIndex,
				'tablet': tabletIndex,
			}));
		} else if (editMode === 'numberOfTurns') {
			dispatch(editWeavingCellNumberOfTurns({
				_id,
				'row': rowIndex,
				'tablet': tabletIndex,
				'numberOfTurns': parseInt(numberOfTurns, 10),
			}));
		}
	}

	handleClickRemoveRow(rowIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const response = confirm(`Do you want to delete row ${rowIndex + 1}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeWeavingRows({
				_id,
				'removeNRows': 1,
				'removeRowsAt': rowIndex,
			}));
			setTimeout(() => this.trackScrolling(), 100); // give time for the deleted rows to be removed
		}
	}

	handleSubmitAddRows(data) {
		const { dispatch, 'pattern': { _id } } = this.props;

		dispatch(addWeavingRows({
			_id,
			'insertNRows': parseInt(data.insertNRows, 10),
			'insertRowsAt': parseInt(data.insertRowsAt - 1, 10),
		}));

		setTimeout(() => this.trackScrolling(), 100); // give the new rows time to render
	}

	handleSubmitEditWeavingCellForm(numberOfTurns) {
		this.setState({
			'numberOfTurns': parseInt(numberOfTurns, 10),
		});
	}

	handleClickEditMode(event) {
		const newEditMode = event.target.value;

		this.setState({
			'editMode': newEditMode,
		});
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
			'controlsOffsetX': 0,
			'isEditing': !isEditing,
			'numberOfTurns': 1,
		});

		dispatch(setIsEditingWeaving(!isEditing));
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditWeaving}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditWeaving}>Edit weaving chart</Button>}
			</div>
		);
	}

	renderCell(rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		return (
			<li
				className="cell value"
				key={`weaving-cell-${rowIndex}-${tabletIndex}`}
			>
				<span
					type={isEditing ? 'button' : undefined}
					onClick={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					onKeyPress={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					role={isEditing ? 'button' : undefined}
					tabIndex={isEditing ? '0' : undefined}
				>
					<WeavingChartCell
						rowIndex={rowIndex}
						tabletIndex={tabletIndex}
					/>
				</span>
			</li>
		);
	}

	renderRow(rowIndex) {
		const {
			numberOfRows,
			numberOfTablets,
		} = this.props;
		const { isEditing } = this.state;
		const rowLabel = numberOfRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(this.renderCell(rowLabel - 1, i));
		}

		return (
			<>
				<ul className="weaving-row">
					<li className="cell label"><span>{rowLabel}</span></li>
					{cells}
					{isEditing && numberOfRows > 1 && (
						<li className="cell delete">
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
			numberOfRows,
		} = this.props;

		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
			rows.push(
				<li
					className="row"
					key={`weaving-row-${i}`}
				>
					{this.renderRow(i)}
				</li>,
			);
		}

		return (
			<>
				<ul className="weaving-chart">
					{rows}
				</ul>
				{this.renderTabletLabels()}
			</>
		);
	}

	renderEditOptions() {
		const { editMode } = this.state;
		const options = [
			{
				'name': 'Edit turning direction',
				'value': 'direction',
			},
			{
				'name': 'Edit number of turns',
				'value': 'numberOfTurns',
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
				<EditWeavingCellForm
					canEdit={editMode === 'numberOfTurns'}
					handleSubmit={this.handleSubmitEditWeavingCellForm}
					numberOfTurns={numberOfTurns}
					rowIndex={rowIndex}
					tabletIndex={tabletIndex}
				/>
				<hr className="clearing" />
				<AddRowsForm
					enableReinitialize={true}
					handleSubmit={this.handleSubmitAddRows}
					numberOfRows={numberOfRows}
				/>
			</div>
		);
	}

	render() {
		const { 'pattern': { createdBy } } = this.props;
		const { isEditing } = this.state;
		const canEdit = createdBy === Meteor.userId();

		return (
			<div className={`weaving ${isEditing ? 'editing' : ''}`}>
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

WeavingDesignIndividual.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WeavingDesignIndividual;
