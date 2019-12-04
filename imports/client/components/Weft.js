import React, { PureComponent } from 'react';

import { Button } from 'reactstrap';
import PropTypes from 'prop-types';

import {
	editPaletteColor,
	editWeftColor,
} from '../modules/pattern';

import './Threading.scss';
import { DEFAULT_PALETTE } from '../../modules/parameters';
import Palette from './Palette';
import './Weft.scss';

// the weft cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class Weft extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
			'selectedColorIndex': 0,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRestoreDefaults',
			'handleClickWeft',
			'handleEditColor',
			'selectColor',
			'toggleEditWeft',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
		});
	}

	handleClickRestoreDefaults() {
		const { dispatch, 'pattern': { _id } } = this.props;

		DEFAULT_PALETTE.forEach((colorHexValue, index) => {
			dispatch(editPaletteColor({
				_id,
				'colorHexValue': colorHexValue,
				'colorIndex': index,
			}));
		});
	}

	handleEditColor(colorHexValue) {
		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editPaletteColor({
			_id,
			'colorHexValue': colorHexValue,
			'colorIndex': selectedColorIndex,
		}));
	}

	handleClickWeft() {
		const { isEditing } = this.state;

		if (!isEditing) {
			return;
		}

		const { dispatch, 'pattern': { _id } } = this.props;
		const { selectedColorIndex } = this.state;

		dispatch(editWeftColor({
			_id,
			'colorIndex': selectedColorIndex,
		}));
	}

	toggleEditWeft() {
		const { isEditing } = this.state;

		this.setState({
			'isEditing': !isEditing,
		});
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing
					? <Button color="primary" onClick={this.toggleEditWeft}>Done</Button>
					: <Button color="primary" onClick={this.toggleEditWeft}>Edit weft color</Button>}
			</div>
		);
	}

	renderPalette() {
		const {
			colorBookAdded,
			colorBooks,
			dispatch,
			'pattern': { palette },
		} = this.props;
		const { selectedColorIndex } = this.state;

		return (
			<Palette
				colorBookAdded={colorBookAdded}
				colorBooks={colorBooks}
				dispatch={dispatch}
				handleClickRestoreDefaults={this.handleClickRestoreDefaults}
				handleEditColor={this.handleEditColor}
				palette={palette}
				selectColor={this.selectColor}
				selectedColorIndex={selectedColorIndex}
			/>
		);
	}

	renderWeft() {
		const {
			'pattern': { palette, weftColor },
		} = this.props;
		const { isEditing } = this.state;

		return (
			<label htmlFor="weft-color" className="text">
				<span className="text">Weft color:</span>
				<span
					className="weft-color"
					id="weft-color"
					onClick={isEditing ? this.handleClickWeft : undefined}
					onKeyPress={isEditing ? this.handleClickWeft : undefined}
					role={isEditing ? 'button' : undefined}
					style={{ 'background': palette[weftColor] }}
					tabIndex={isEditing ? '0' : undefined}
					type={isEditing ? 'button' : undefined}
				/>
			</label>
		);
	}

	render() {
		const { isEditing } = this.state;

		return (
			<div className={`weft ${isEditing ? 'editing' : ''}`}>
				{this.renderControls()}
				<div className="content">
					{this.renderWeft()}
					{isEditing && this.renderPalette()}
				</div>
			</div>
		);
	}
}

Weft.propTypes = {
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Weft;
