import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { setColorBookAdded } from '../modules/colorBook';
import EditColorBook from './EditColorBook';
import './ColorBook.scss';

class ColorBook extends PureComponent {
	constructor(props) {
		super(props);

		//const autoEdit = this.autoEditNewColorBook();

		this.state = {
			'selectedColorIndex': 0,
		};

		// Edit color book is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'edit-color-book-holder';

		//this.autoEditNewColorBook();
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	//componentDidUpdate(prevProps) {
		//const autoEdit = this.autoEditNewColorBook();
		//if (autoEdit) {
			//this.setIsEditing(true);
		//}
	//}

	componentWillUnmount() {
		document.body.removeChild(this.el);
		//this.setIsEditing(false);
	}

	/* autoEditNewColorBook = () => {
		const {
			colorBookAdded,
			'colorBook': { _id },
			dispatch,
		} = this.props;

		// automatically edit a new color book
		if (colorBookAdded === _id) {
			dispatch(setColorBookAdded(''));
			return true;
		}
	} */

	/* setIsEditing = (isEditing) => {
		const { handleEditColorBook } = this.props;
		this.setState({
			'isEditing': isEditing,
		});
		handleEditColorBook(isEditing);
	}

	handleClickDoneEditing = () => {
		this.setIsEditing(false);
	}

	handleClickEdit = () => {
		this.setIsEditing(true);
	}; */

	handleClickColor(index) {
		const {
			'colorBook': { colors },
			onSelectColor,
		} = this.props;
		this.setState({
			'selectedColorIndex': index,
		});

		const color = colors[index];
		onSelectColor(color);
	}

	renderColor(color, index) {
		const { isEditingColors, selectedColorIndex } = this.state;

		const identifier = `book-color-${index}`;

		return (
			<label // eslint-disable-line jsx-a11y/label-has-associated-control
				htmlFor={identifier}
				key={identifier}
				title={`Thread colour ${color}`}
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
			handleEditColorBook,
		} = this.props;

		return (
			ReactDOM.createPortal(
				<EditColorBook
					colorBook={colorBook}
					context={context}
					dispatch={dispatch}
					handleClickDone={() => handleEditColorBook(false)}
				/>,
				this.el,
			)
		);
	}

	render() {
		const {
			'colorBook': { colors },
			context,
			isEditing,
		} = this.props;

		const hintText = context === 'user'
			? 'A set of reusable colour swatches that you can assign to any pattern palette.'
			: 'Select a colour swatch above to assign that colour to the selected cell in the working palette below.';

		const controlElm = (
			<div className="buttons">
				<Button color="danger" className="remove" onClick={() => handleClickRemoveColorBook({ _id, name })}>Delete</Button>
				<Button color="primary" onClick={this.handleClickEdit}>Edit</Button>
			</div>
		);

		const colorsElm = (
			<div className="colors">
				{colors.map((color, index) => this.renderColor(color, index))}
			</div>
		);

		return (
			<div className="color-book">
				{!isEditing && colorsElm}
				{!isEditing && <p className="hint">{hintText}</p>}
				{isEditing && this.renderEditColorBookPanel()}
			</div>
		);
	}
}

ColorBook.propTypes = {
	//'canEdit': PropTypes.bool.isRequired,
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'context': PropTypes.string,
	'dispatch': PropTypes.func.isRequired,
	'handleEditColorBook': PropTypes.func.isRequired,
	'isEditing': PropTypes.bool.isRequired,
	//'handleClickRemoveColorBook': PropTypes.func.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBook;
