import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import { editColorBookColor, editColorBookName } from '../modules/colorBook';
import EditableText from './EditableText';

import './EditColorBook.scss';

class EditColorBook extends PureComponent {
	constructor(props) {
		const { 'colorBook': { colors } } = props;
		super(props);

		this.state = {
			'selectedColorIndex': 0,
			'workingColor': colors[0], // track live selection in color picker
			'showEditColorPanel': false,
		};

		// Color picker is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'edit-color-book-picker-holder';
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
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
		const {
			showEditColorPanel,
			selectedColorIndex,
		} = this.state;

		if (!showEditColorPanel) {
			// open edit color panel
			this.setState({
				'showEditColorPanel': true,
			});
		} else if (index === selectedColorIndex) {
			// close edit color panel if you click the same color again, otherwise just switch to the new color
			this.setState({
				'showEditColorPanel': false,
			});
		}

		this.setState({
			'selectedColorIndex': index,
			'workingColor': colors[index],
		});
	}

	acceptColorChange = () => {
		const { 'colorBook': { _id }, dispatch } = this.props;
		const { workingColor, selectedColorIndex } = this.state;

		dispatch(editColorBookColor({
			_id,
			'colorHexValue': workingColor,
			'colorIndex': selectedColorIndex,
		}));

		this.setState({
			'showEditColorPanel': false,
		});
	};

	cancelColorChange = () => {
		this.setState({
			'showEditColorPanel': false,
		});
	}

	handleColorChange = (colorObject) => {
		this.setState({
			'workingColor': colorObject.hex,
		});
	}

	renderEditColorPanel() {
		const { workingColor } = this.state;

		return (
			ReactDOM.createPortal(
				<div className="color-picker">
					<PhotoshopPicker
						color={workingColor}
						onChangeComplete={this.handleColorChange}
						onAccept={this.acceptColorChange}
						onCancel={this.cancelColorChange}
					/>
				</div>,
				this.el,
			)
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
		const {
			showEditColorPanel,
		} = this.state;

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

		const hintText = <p className="hint">To edit a colour, click one of the colour swatches above.</p>;

		return (
			<div className="edit-color-book">
				{showEditColorPanel && this.renderEditColorPanel()}
				{doneButton}
				{nameElm}
				{colorsElm}
				{hintText}
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
