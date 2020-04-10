import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { editColorBookColor, editColorBookName } from '../modules/colorBook';
import InlineColorPicker from './InlineColorPicker';
import EditableText from './EditableText';

import './EditColorBook.scss';

class EditColorBook extends PureComponent {
	constructor(props) {
		const { 'colorBook': { colors } } = props;
		super(props);

		this.state = {
			'selectedColorIndex': 0,
			'colorValue': colors[0], // track live selection in color picker
			'pickerReinitialize': false,
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

	handleSubmitEditName = ({ fieldValue, fieldName }) => {
		const {
			'colorBook': { _id },
			dispatch,
		} = this.props;

		dispatch(editColorBookName({
			_id,
			'name': fieldValue,
		}));
	}

	handleClickColor = (index) => {
		const { 'colorBook': { colors } } = this.props;

		this.setState({
			'colorValue': colors[index],
			'selectedColorIndex': index,
			'pickerReinitialize': true, // reset initial color
		});
	}

	acceptColorChange = () => {
		const { 'colorBook': { _id }, dispatch } = this.props;
		const { colorValue, selectedColorIndex } = this.state;

		dispatch(editColorBookColor({
			_id,
			'colorHexValue': colorValue,
			'colorIndex': selectedColorIndex,
		}));
	};

	handleColorChange = (colorObject) => {
		this.setState({
			'colorValue': colorObject.hex,
		});
	}

	renderEditColorPanel() {
		const {
			colorValue,
			pickerReinitialize,
		} = this.state;

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

	renderColor(color, index) {
		const { selectedColorIndex } = this.state;

		const identifier = `book-color-${index}`;

		return (
			<label // eslint-disable-line jsx-a11y/label-has-associated-control
				htmlFor={identifier}
				key={identifier}
				title="Thread colour"
			>
				<span // eslint-disable-line jsx-a11y/control-has-associated-label
					className={`color ${(selectedColorIndex === index) ? 'selected' : ''}`}
					key={identifier}
					onClick={() => this.handleClickColor(index)}
					onKeyPress={() => this.handleClickColor(index)}
					role="button"
					style={{ 'backgroundColor': color }}
					tabIndex="0"
				/>
			</label>
		);
	}

	render() {
		const {
			handleClickDone,
			'colorBook': { colors, name },
		} = this.props;

		const doneButton = (
			<Button
				color="primary"
				className="done"
				onClick={handleClickDone}
				title="Done"
			>
				Done
			</Button>
		);

		const nameElm = (
			<EditableText
				autoFocus={true}
				canEdit={true}
				editButtonText="Edit name"
				fieldName="name"
				onClickSave={this.handleSubmitEditName}
				title="Name"
				type="input"
				fieldValue={name}
			/>
		);

		const colorsElm = (
			<div className="colors">
				{colors.map((color, index) => this.renderColor(color, index))}
			</div>
		);

		return (
			<div className="edit-color-book">
				{doneButton}
				{nameElm}
				{this.renderEditColorPanel()}
				{colorsElm}
			</div>
		);
	}
}

EditColorBook.propTypes = {
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleClickDone': PropTypes.func.isRequired,
};

export default EditColorBook;
