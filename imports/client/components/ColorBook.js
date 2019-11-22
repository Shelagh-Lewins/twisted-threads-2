import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import { editColorBookColor, editColorBookName } from '../modules/colorBook';
import EditColorBookNameForm from './EditColorBookNameForm';
import './ColorBook.scss';

class ColorBook extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditingColors': false,
			'isEditingName': false,
			'newColor': '',
			'selectedColorIndex': 0,
			'showEditColorPanel': false,
		};

		// Color picker is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'edit-color-book-picker-holder';

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickColor',
			'handleCancelEditName',
			'handleClickDone',
			'handleClickEditColors',
			'handleClickEditName',
			'handleSubmitEditName',
			'handleColorChange',
			'acceptColorChange',
			'cancelColorChange',
			'selectColor',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentDidUpdate(prevProps) {
		const { colorBook } = this.props;

		if (prevProps.colorBook._id !== colorBook._id) {
			this.setState({
				'isEditingColors': false,
				'isEditingName': false,
			});
		}
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
		});
	}

	handleClickColor(colorIndex) {
		const { colorBook, onSelectColor } = this.props;
		const {
			isEditingColors,
			showEditColorPanel,
			selectedColorIndex,
		} = this.state;

		const color = colorBook.colors[colorIndex];

		if (isEditingColors) {
			if (!showEditColorPanel) {
				// open edit color panel
				this.setState({
					'showEditColorPanel': true,
				});
			} else if (colorIndex === selectedColorIndex) {
				// close edit color panel if you click the same color again, otherwise just switch to the new color
				this.setState({
					'showEditColorPanel': false,
				});
			}
		} else {
			onSelectColor(color);
		}

		this.selectColor(colorIndex);

		this.setState({
			'newColor': colorBook.colors[colorIndex],
		});
	}

	handleClickDone() {
		this.setState({
			'isEditingColors': false,
			'showEditColorPanel': false,
		});
	}

	handleClickEditColors() {
		this.setState({
			'isEditingColors': true,
		});
	}

	handleClickEditName() {
		this.setState({
			'isEditingName': true,
		});
	}

	handleCancelEditName() {
		this.setState({
			'isEditingName': false,
		});
	}

	handleSubmitEditName({ name }) {
		const { 'colorBook': { _id }, dispatch } = this.props;

		dispatch(editColorBookName({
			_id,
			name,
		}));

		this.setState({
			'isEditingName': false,
		});
	}

	acceptColorChange() {
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
	}

	editColorBookName({ _id, name }) {
		const { dispatch } = this.props;

		dispatch(editColorBookName({
			_id,
			name,
		}));

		this.setState({
			'showEditNameForm': false,
		});
	}

	cancelColorChange() {
		this.setState({
			'showEditColorPanel': false,
		});
	}

	handleColorChange(colorObject) {
		this.setState({
			'newColor': colorObject.hex,
		});
	}

	renderColor(color, index) {
		const { isEditingColors, selectedColorIndex } = this.state;

		const identifier = `book-color-${index}`;

		return (
			<label // eslint-disable-line jsx-a11y/label-has-associated-control
				htmlFor={identifier}
				key={identifier}
				title="Thread color"
			>
				<span // eslint-disable-line jsx-a11y/control-has-associated-label
					className={`color ${isEditingColors && (selectedColorIndex === index) ? 'selected' : ''}`}
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

	render() {
		const { colorBook, handleClickRemoveColorBook } = this.props;
		const {
			isEditingColors,
			isEditingName,
			showEditColorPanel,
		} = this.state;

		const controlElm = isEditingColors
			? (
				<>
					<div className="buttons">
						<Button color="secondary" onClick={this.handleClickDone}>Done</Button>
					</div>
					<p className="hint">Editing colors: select a color to open a color picker</p>
				</>
			)
			: (
				<>
					<div className="buttons">
						<Button color="danger" onClick={() => handleClickRemoveColorBook(colorBook._id)}>Delete</Button>
						<Button color="secondary" onClick={this.handleClickEditName}>Edit name</Button>
						<Button color="secondary" onClick={this.handleClickEditColors}>Edit colors</Button>
					</div>
					<p className="hint">Select a color to assign it to the threading color palette</p>
				</>
			);

		const editNameForm = (
			<EditColorBookNameForm
				name={colorBook.name}
				handleCancel={this.handleCancelEditName}
				handleSubmit={this.handleSubmitEditName}
			/>
		);

		return (
			<div className="color-book">
				{!isEditingName && showEditColorPanel && this.renderEditColorPanel()}
				<div className="controls">
					{!isEditingName && controlElm}
				</div>
				<div className="colors">
					{!isEditingName && colorBook.colors.map((color, index) => this.renderColor(color, index))}
				</div>
				{isEditingName && editNameForm}
			</div>
		);
	}
}

ColorBook.propTypes = {
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleClickRemoveColorBook': PropTypes.func.isRequired,
	'onSelectColor': PropTypes.func,
};


export default ColorBook;