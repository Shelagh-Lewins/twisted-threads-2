import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import PropTypes from 'prop-types';
import {
	addWeavingRows,
	removeWeavingRows,
	setIsEditingWeaving,
} from '../modules/pattern';
import calculateScrolling from '../modules/calculateScrolling';
import FreehandChartCell from './FreehandChartCell';
import AddRowsForm from '../forms/AddRowsForm';
import Palette from './Palette';
import { DEFAULT_PALETTE_COLOR } from '../../modules/parameters';
import './Threading.scss';
import './WeavingDesignFreehand.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingDesignFreehand extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'controlsOffsetX': 0,
			'controlsOffsetY': 0,
			'editMode': 'thread',
			'isEditing': false,
			'selectedColorIndex': DEFAULT_PALETTE_COLOR,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickChartCell',
			'handleClickEditMode',
			'handleClickRemoveRow',
			'handleSubmitAddRows',
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
		const { controlsOffsetX, controlsOffsetY } = calculateScrolling({
			'controlsElm': this.controlsRef.current,
			'weavingElm': this.weavingRef.current,
		});

		this.setState({
			controlsOffsetX,
			controlsOffsetY,
		});
	}

	handleClickChartCell(rowIndex, tabletIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing, editMode } = this.state;

		if (!isEditing) {
			return;
		}

		if (editMode === 'thread') {
			console.log('edit thread');
			/* dispatch(editFreehandThread({
				_id,
				'row': rowIndex,
				'tablet': tabletIndex,
			})); */
		} else if (editMode === 'background') {
			console.log('edit background');
			/* dispatch(editFreehandBackground({
				_id,
				'row': rowIndex,
				'tablet': tabletIndex,
				'numberOfTurns': parseInt(numberOfTurns, 10),
			})); */
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
					onClick={isEditing ? () => this.handleClickChartCell(rowIndex, tabletIndex) : undefined}
					onKeyPress={isEditing ? () => this.handleClickChartCell(rowIndex, tabletIndex) : undefined}
					role={isEditing ? 'button' : undefined}
					tabIndex={isEditing ? '0' : undefined}
				>
					<FreehandChartCell
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
				'name': 'Thread',
				'value': 'thread',
			},
			{
				'name': 'Background',
				'value': 'background',
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
			'pattern': { _id, palette },
		} = this.props;
		const {
			controlsOffsetX,
			controlsOffsetY,
			editMode,
		} = this.state;

		let content;

		if (editMode === 'thread') {
			content = (
				<>
					<Palette
						_id={_id}
						canCreateColorBook={canCreateColorBook}
						colorBookAdded={colorBookAdded}
						colorBooks={colorBooks}
						dispatch={dispatch}
						elementId={this.paletteId}
						palette={palette}
						selectColor={this.selectColor}
						initialColorIndex={0}
					/>
				</>
			);
		} else if (editMode === 'background') {

		}

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
				<div className="content">
					{content}
				</div>
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

WeavingDesignFreehand.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WeavingDesignFreehand;
