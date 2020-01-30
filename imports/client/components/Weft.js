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

class Weft extends PureComponent {
	constructor(props) {
		super(props);

		const { 'pattern': weftColor } = props;

		this.state = {
			'isEditing': false,
			'selectedColorIndex': weftColor,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickRestoreDefaults',
			'handleEditColor',
			'selectColor',
			'toggleEditWeft',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	selectColor(index) {
		const { dispatch, 'pattern': { _id } } = this.props;

		dispatch(editWeftColor({
			_id,
			'colorIndex': index,
		}));

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
			canCreateColorBook,
			colorBookAdded,
			colorBooks,
			dispatch,
			'pattern': { palette, weftColor },
		} = this.props;

		return (
			<Palette
				canCreateColorBook={canCreateColorBook}
				colorBookAdded={colorBookAdded}
				colorBooks={colorBooks}
				dispatch={dispatch}
				elementId="weft-palette"
				handleClickRestoreDefaults={this.handleClickRestoreDefaults}
				handleEditColor={this.handleEditColor}
				palette={palette}
				selectColor={this.selectColor}
				selectedColorIndex={weftColor}
			/>
		);
	}

	renderWeft() {
		const {
			'pattern': { palette, weftColor },
		} = this.props;

		return (
			<>
				<span className="text">Weft color:</span>
				<span
					className="weft-color"
					id="weft-color"
					style={{ 'background': palette[weftColor] }}
				/>
			</>
		);
	}

	render() {
		const { 'pattern': { createdBy } } = this.props;
		const { isEditing } = this.state;
		const canEdit = createdBy === Meteor.userId();

		return (
			<div className={`weft ${isEditing ? 'editing' : ''}`}>
				{canEdit && this.renderControls()}
				<div className="content">
					{this.renderWeft()}
					{isEditing && this.renderPalette()}
					<div className="clearing" />
				</div>
			</div>
		);
	}
}

Weft.propTypes = {
	'canCreateColorBook': PropTypes.bool.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Weft;
