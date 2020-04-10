import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
	editPaletteColor,
	getPalette,
} from '../modules/pattern';
import {
	getCanAddPatternImage,
	getCanCreateColorBook,
} from '../modules/auth';
import { SVGPaletteEmpty } from '../modules/svg';
import { DEFAULT_PALETTE } from '../../modules/parameters';
import InlineColorPicker from './InlineColorPicker';
import ColorBooks from './ColorBooks';
import './Palette.scss';

// colors have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class Palette extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'editMode': 'colorPicker',
			'isEditing': false,
			'isEditingColorBook': false,
			'colorValue': props.palette[props.initialColorIndex],
			'pickerReinitialize': false,
			'selectedColorIndex': props.initialColorIndex,
		};
	}

	componentDidUpdate() {
		const { pickerReinitialize } = this.state;

		if (pickerReinitialize) {
			this.setState({
				'pickerReinitialize': false,
			});
		}
	}

	handleClickDone = () => {
		this.setState({
			'isEditing': false,
		});
	}

	handleClickEdit = () => {
		const { selectColor } = this.props;
		const { selectedColorIndex } = this.state;

		// cannot edit empty hole cell
		if (selectedColorIndex === -1) {
			selectColor(0);
		}

		this.setState({
			'isEditing': true,
		});
	}

	handleClickColor = (colorIndex) => {
		const { palette, selectColor } = this.props;

		selectColor(colorIndex);

		this.setState({
			'colorValue': palette[colorIndex],
			'selectedColorIndex': colorIndex,
			'pickerReinitialize': true, // reset initial color
		});
	}

	handleClickEmptyHole = () => {
		const { selectColor } = this.props;
		const { isEditing } = this.state;

		if (isEditing) {
			return; // cannot edit empty hole cell
		}

		selectColor(-1);
	}

	handleClickEditMode = (event) => {
		const newEditMode = event.target.value;

		this.setState({
			'editMode': newEditMode,
		});
	}

	acceptColorChange = () => {
		const { colorValue } = this.state;

		this.handleEditColor(colorValue);
	}

	handleColorChange = (colorObject) => {
		this.setState({
			'colorValue': colorObject.hex,
		});
	}

	handleClickRestoreDefaults = () => {
		const { _id, dispatch } = this.props;

		DEFAULT_PALETTE.forEach((colorHexValue, index) => {
			dispatch(editPaletteColor({
				_id,
				'colorHexValue': colorHexValue,
				'colorIndex': index,
			}));
		});
	}

	handleEditColorBook = (isEditingColorBook) => {
		this.setState({
			isEditingColorBook,
		});
	}

	handleEditColor = (colorHexValue) => {
		const { _id, dispatch } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editPaletteColor({
			_id,
			'colorHexValue': colorHexValue,
			'colorIndex': selectedColorIndex,
		}));
	}

	renderEmptyHole = () => {
		const { isEditing, isEditingColorBook } = this.state;
		const { selectedColorIndex } = this.state;

		return (
			<label // eslint-disable-line jsx-a11y/label-has-associated-control
				htmlFor="empty-hole"
				title="Empty hole"
			>
				Empty hole
				<span // eslint-disable-line jsx-a11y/control-has-associated-label
					className={`empty-hole ${selectedColorIndex === -1 ? 'selected' : ''} ${isEditingColorBook ? 'disabled' : ''}`}
					id="empty-hole"
					name="empty-hole"
					onClick={() => this.handleClickEmptyHole()}
					onKeyPress={() => this.handleClickEmptyHole()}
					role="button"
					tabIndex="0"
				>
					<SVGPaletteEmpty
						stroke={isEditing ? '#666' : '#000'}
					/>
				</span>
			</label>
		);
	}

	renderColors = () => {
		const { palette } = this.props;
		const { isEditingColorBook, selectedColorIndex } = this.state;

		return (
			<div className="color-holder">
				{palette.map((color, colorIndex) => {
					const identifier = `palette-color-${colorIndex}`;

					// eslint doesn't associate the label with the span, so I've disabled the rule
					return (
						<label // eslint-disable-line jsx-a11y/label-has-associated-control
							htmlFor={identifier}
							key={identifier}
							title={`Thread color ${color}`}
						>
							Thread color
							<span // eslint-disable-line jsx-a11y/control-has-associated-label
								className={`color ${selectedColorIndex === colorIndex ? 'selected' : ''} ${isEditingColorBook ? 'disabled' : ''}`}
								id={identifier}
								name={identifier}

								onClick={() => this.handleClickColor(colorIndex)}
								onKeyPress={() => this.handleClickColor(colorIndex)}
								role="button"
								style={{ 'backgroundColor': color }}
								tabIndex="0"
							/>
						</label>
					);
				})}
			</div>
		);
	}

	renderEditColorPanel = () => {
		const {
			canCreateColorBook,
			colorBookAdded,
			colorBooks,
			dispatch,
		} = this.props;
		const {
			editMode,
			colorValue,
			isEditingColorBook,
			pickerReinitialize,
		} = this.state;

		if (editMode === 'colorPicker') {
			if (pickerReinitialize) {
				return;
			}

			return (
				<InlineColorPicker
					color={colorValue}
					onAccept={this.acceptColorChange}
					onChangeComplete={this.handleColorChange}
				/>
			);
		}

		return (
			<ColorBooks
				canCreateColorBook={canCreateColorBook}
				canEdit={true /* palette is only shown if user can edit */}
				colorBookAdded={colorBookAdded}
				colorBooks={colorBooks}
				dispatch={dispatch}
				handleEditColorBook={this.handleEditColorBook}
				isEditingColorBook={isEditingColorBook}
				onSelectColor={this.handleEditColor}
				cancelColorChange={this.cancelColorChange}
				closeColorBooks={this.closeColorBooks}
			/>
		);
	}

	renderEditOptions = () => {
		const { editMode } = this.state;
		const options = [
			{
				'name': 'Color picker',
				'value': 'colorPicker',
			},
			{
				'name': 'Color books',
				'value': 'colorBooks',
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
				<Button
					className="restore-defaults"
					color="secondary"
					onClick={this.handleClickRestoreDefaults}
				>
					Restore default colors
				</Button>
			</>
		);
	}

	renderControls() {
		const {
			isEditing,
		} = this.state;

		return (
			<div className="controls">
				{isEditing && this.renderEditOptions()}
				<div className="toggle">
					{isEditing
						? <Button color="primary" onClick={this.handleClickDone}>Done</Button>
						: <Button color="primary" onClick={this.handleClickEdit}>Edit thread colors</Button>}
				</div>
			</div>
		);
	}

	render() {
		const { elementId } = this.props;
		const {
			isEditing,
		} = this.state;

		return (
			<div id={elementId} className={`palette ${isEditing ? 'editing' : ''}`}>
				{this.renderControls()}
				{isEditing && this.renderEditColorPanel()}
				<div className="swatches">
					{this.renderEmptyHole()}
					{this.renderColors()}
				</div>
			</div>
		);
	}
}

Palette.propTypes = {
	'_id': PropTypes.string.isRequired,
	'canCreateColorBook': PropTypes.bool.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'elementId': PropTypes.string.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'selectColor': PropTypes.func.isRequired,
	'initialColorIndex': PropTypes.number.isRequired,
};

function mapStateToProps(state) {
	return {
		'canAddPatternImage': getCanAddPatternImage(state),
		'canCreateColorBook': getCanCreateColorBook(state),
		'colorBookAdded': state.colorBook.colorBookAdded,
		'palette': getPalette(state),
	};
}

export default connect(mapStateToProps)(Palette);
