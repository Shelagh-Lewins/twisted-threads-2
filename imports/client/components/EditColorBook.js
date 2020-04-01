import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import { editColorBookColor, editColorBookName } from '../modules/colorBook';
import EditableText from './EditableText';
//import EditColorBookNameForm from '../forms/EditColorBookNameForm';

import './EditColorBook.scss';

class EditColorBook extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			//'isEditingColors': false,
			'isEditingName': false,
			//'newColor': '',
			'selectedColorIndex': 0,
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

	componentDidUpdate(prevProps) {
		const { colorBook } = this.props;

		if (prevProps.colorBook._id !== colorBook._id) {
			this.setState({
				//'isEditingColors': false,
				'isEditingName': false,
			});
		}
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	handleClickEditName = () => {
		//const { handleEditColorBook } = this.props;

		this.setState({
			'isEditingName': true,
		});

		//handleEditColorBook(true);
	}

	handleCancelEditName = () => {
		//const { handleEditColorBook } = this.props;

		this.setState({
			'isEditingName': false,
		});

		//handleEditColorBook(false);
	}

	handleSubmitEditName = ({ fieldValue, fieldName }) => {
		const {
			'colorBook': { _id },
			dispatch,
			//handleEditColorBook,
		} = this.props;

		dispatch(editColorBookName({
			_id,
			'name': fieldValue,
		}));

		this.setState({
			'isEditingName': false,
		});

		//handleEditColorBook(false);
	}

	handleClickColor = (index) => {
		const { colorBook, onSelectColor } = this.props;
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
		});
	}

	acceptColorChange = () => {
		const { 'colorBook': { _id }, dispatch } = this.props;
		const { newColor, selectedColorIndex } = this.state;

		dispatch(editColorBookColor({
			_id,
			'colorHexValue': newColor,
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
			'newColor': colorObject.hex,
		});
	}

	renderEditColorPanel() {
		const { newColor } = this.state;

		return (
			ReactDOM.createPortal(
				<div className="color-picker">
					<PhotoshopPicker
						color={newColor}
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
				color="secondary"
				className="done"
				onClick={handleClickDone}
				title="Done"
			>
				Done
			</Button>
		);

		const nameElm = (
			<EditableText
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
				{showEditColorPanel && this.renderEditColorPanel()}
				{doneButton}
				{nameElm}
				{colorsElm}
			</div>
		);
	}
}

EditColorBook.propTypes = {
	//'canEdit': PropTypes.bool.isRequired,
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'context': PropTypes.string,
	'dispatch': PropTypes.func.isRequired,
	'handleClickDone': PropTypes.func.isRequired,
	//'handleClickRemoveColorBook': PropTypes.func.isRequired,
	//'handleEditColorBook': PropTypes.func.isRequired,
	//'onSelectColor': PropTypes.func,
};

export default EditColorBook;
