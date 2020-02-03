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

		this.state = {
			'isEditing': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'toggleEditWeaving',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		// ref to find nodes so we can keep controls in view
		this.weavingRef = React.createRef();
		this.controlsRef = React.createRef();
	}

	handleClickRemoveRow(rowIndex) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const response = confirm(`Do you want to delete row ${rowIndex + 1}?`); // eslint-disable-line no-restricted-globals

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

		/* if (!isEditing) {
			document.addEventListener('scroll', this.trackScrolling);
			window.addEventListener('resize', this.trackScrolling);
			setTimeout(() => this.trackScrolling(), 100); // give the controls time to render
		} else {
			document.removeEventListener('scroll', this.trackScrolling);
			window.removeEventListener('resize', this.trackScrolling);
		} */

		this.setState({
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
					: <Button color="primary" onClick={this.toggleEditWeaving}>Edit weaving design</Button>}
			</div>
		);
	}

	renderCell(rowIndex, tabletIndex) {
		const { isEditing } = this.state;

		return (
			<li
				className={`cell value ${tabletIndex === 0 && 'first-tablet'}`}
				key={`twill-design-cell-${rowIndex}-${tabletIndex}`}
			>
				<span
					type={isEditing ? 'button' : undefined}
					onClick={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					onKeyPress={isEditing ? () => this.handleClickWeavingCell(rowIndex, tabletIndex) : undefined}
					role={isEditing ? 'button' : undefined}
					tabIndex={isEditing ? '0' : undefined}
				>
					<span />
				</span>
			</li>
		);
	}

	renderRow(rowIndex) {
		const {
			numberOfTablets,
			pattern,
		} = this.props;

		const {
			'patternDesign': {
				twillChangeChart,
				twillPatternChart,
			},
		} = pattern;

		const numberOfChartRows = twillPatternChart.length;

		const { isEditing } = this.state;
		const rowLabel = numberOfChartRows - rowIndex;

		const cells = [];
		for (let i = 0; i < numberOfTablets; i += 1) {
			cells.push(this.renderCell(rowLabel - 1, i));
		}

		return (
			<>
				<ul className={`${rowIndex === 0 && 'last-row'} ${(rowIndex === numberOfChartRows - 1) && 'first-row'}`}>
					<li className="row-label even"><span>{rowLabel * 2}</span></li>
					<li className="row-label odd"><span>{(rowLabel * 2) - 1}</span></li>
					{cells}
					{isEditing && numberOfChartRows > 1 && (
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
			pattern,
		} = this.props;

		const {
			'patternDesign': {
				twillChangeChart,
				twillPatternChart,
			},
		} = pattern;

		const { isEditing } = this.state;

		const rows = [];
		for (let i = 0; i < twillPatternChart.length; i += 1) {
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
						<p>Each chart row represents two weaving rows.</p>
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
			<div>
				toolbar
			</div>
		);

		/* return (
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
		); */
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
