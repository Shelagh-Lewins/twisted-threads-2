import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { editColorBookColor, editColorBookName } from '../modules/colorBook';
import EditColorBook from './EditColorBook';
import './ColorBook.scss';

class ColorBook extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'newColor': '',
			'selectedColorIndex': 0,
		};

		// Edit color book is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'edit-color-book-holder';
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	handleClickDoneEditing = () => {
		const { handleEditColorBook } = this.props;

		this.setState({
			'isEditing': false,
			'showEditColorPanel': false,
		});

		handleEditColorBook(false);
	}

	handleClickEdit = () => {
		const { handleEditColorBook } = this.props;

		this.setState({
			'isEditing': true,
		});

		handleEditColorBook(true);
	};

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

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
		});
	}

	handleCancelEditName() {
		const { handleEditColorBook } = this.props;

		this.setState({
			'isEditingName': false,
		});

		handleEditColorBook(false);
	}

	handleSubmitEditName({ name }) {
		const {
			'colorBook': { _id },
			dispatch,
			handleEditColorBook,
		} = this.props;

		dispatch(editColorBookName({
			_id,
			name,
		}));

		this.setState({
			'isEditingName': false,
		});

		handleEditColorBook(false);
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
				title="Thread colour"
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

	renderEditColorBookPanel() {
		const {
			colorBook,
			context,
			dispatch,
		} = this.props;

		return (
			ReactDOM.createPortal(
				<EditColorBook
					colorBook={colorBook}
					context={context}
					dispatch={dispatch}
					handleClickDone={this.handleClickDoneEditing}
				/>,
				this.el,
			)
		);
	}

	render() {
		const {
			canEdit,
			colorBook,
			'colorBook': { _id, name },
			context,
			handleClickRemoveColorBook,
		} = this.props;
		const {
			isEditing,
			isEditingColors,
			isEditingName,
		} = this.state;

		let hintText = 'To open the colour picker, select one of the swatches above';

		if (!isEditingColors) {
			hintText = context === 'user'
				? 'A set of reusable colour swatches that you can assign to any pattern palette.'
				: 'Select a colour swatch above to assign that colour to the palette.';
		}

		const controlElm = (
			<div className="buttons">
				<Button color="danger" className="remove" onClick={() => handleClickRemoveColorBook({ _id, name })}>Delete</Button>
				<Button color="primary" onClick={this.handleClickEdit}>Edit</Button>
			</div>
		);

		return (
			<div className="color-book">
				{canEdit && (
					<div className="controls">
						{controlElm}
					</div>
				)}
				<div className="colors">
					{colorBook.colors.map((color, index) => this.renderColor(color, index))}
				</div>
				{!isEditingName && <p className="hint">{hintText}</p>}
				{isEditing && this.renderEditColorBookPanel()}
			</div>
		);
	}
}

ColorBook.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'context': PropTypes.string,
	'dispatch': PropTypes.func.isRequired,
	'handleClickRemoveColorBook': PropTypes.func.isRequired,
	'handleEditColorBook': PropTypes.func.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBook;
