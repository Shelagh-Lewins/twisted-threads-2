// view and edit the user's color books

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { addColorBook, removeColorBook } from '../modules/colorBook';
import { getRemoveColorBookMessage } from '../../modules/parameters';
import AddColorBookForm from '../forms/AddColorBookForm';
import ColorBook from './ColorBook';
import './ColorBooks.scss';

// colors have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class ColorBooks extends PureComponent {
	constructor(props) {
		super(props);

		const { colorBooks } = props;
		const selectedColorBook = colorBooks.length > 0 ? colorBooks[0]._id : '';

		this.state = {
			'selectedColorBook': selectedColorBook,
			'showAddColorBookForm': false,
		};

		// New color book is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'add-color-book-holder';
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentDidUpdate(prevProps) {
		const { colorBookAdded } = this.props;

		// automatically select a new color book
		if (prevProps.colorBookAdded === '' && colorBookAdded !== '') {
			this.setState({ // eslint-disable-line react/no-did-update-set-state
				'selectedColorBook': colorBookAdded,
			});
		}
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	// show the form to add a new color book
	handleClickAdd = () => {
		this.setState({
			'showAddColorBookForm': true,
		});
	}

	// actually add a new color book
	handleClickAddColorBook = ({ colors, name }) => {
		const { dispatch } = this.props;

		dispatch(addColorBook({ colors, name }));
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	// hide the add color book form and take no action
	cancelAddColorBook = () => {
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	handleClickRemoveColorBook = () => {
		const { colorBooks, dispatch } = this.props;
		const { selectedColorBook } = this.state;

		const colorBook = colorBooks.find((book) => book._id === selectedColorBook);
		const { name } = colorBook;

		const response = confirm(getRemoveColorBookMessage(name)); // eslint-disable-line no-restricted-globals

		if (response === true) {
			// deselect the removed color book
			let newSelection;
			if (colorBooks.length === 1) { // there will be no remaining color books
				newSelection = '';
			} else if (colorBooks[0]._id === selectedColorBook) {
				newSelection = colorBooks[1]._id; // eslint-disable-line prefer-destructuring
			} else {
				newSelection = colorBooks[0]._id; // eslint-disable-line prefer-destructuring
			}

			this.setState({
				'selectedColorBook': newSelection,
			});

			dispatch(removeColorBook(selectedColorBook));
		}
	}

	handleChangeColorBook = (event) => {
		this.setState({
			'selectedColorBook': event.target.value,
		});
	}

	renderColorBookSelect = () => {
		const { colorBooks, isEditingColorBook } = this.props;
		const { selectedColorBook, showAddColorBookForm } = this.state;

		return (
			<div className="select-color-book">
				Current colour book:&nbsp;
				<select
					disabled={isEditingColorBook || showAddColorBookForm}
					key="select-color-book"
					onChange={this.handleChangeColorBook}
					value={selectedColorBook}
				>
					{colorBooks.map((colorBook) => (
						<option
							key={`color-book=${colorBook._id}`}
							label={colorBook.name}
							value={colorBook._id}
						>
							{colorBook.name}
						</option>
					))}
				</select>
			</div>
		);
	}

	renderNewColorBookPanel() {
		return (
			ReactDOM.createPortal(
				<div className="wrapper">
					<AddColorBookForm
						handleCancel={this.cancelAddColorBook}
						handleSubmit={this.handleClickAddColorBook}
					/>
				</div>,
				this.el,
			)
		);
	}

	renderColorBookButtons() {
		const {
			canCreateColorBook,
			canEdit,
			handleEditColorBook,
			isEditingColorBook,
		} = this.props;
		const { showAddColorBookForm } = this.state;
		const disabled = isEditingColorBook || showAddColorBookForm;

		return (
			<div className="buttons-books">
				{canEdit && (
					<>
						<Button
							color="secondary"
							disabled={disabled}
							onClick={() => handleEditColorBook(true)}
							title="Edit"
						>
							Edit
						</Button>
						<Button
							color="danger"
							disabled={disabled}
							onClick={this.handleClickRemoveColorBook}
							title="Delete"
						>
							Delete
						</Button>
					</>
				)}
				{canCreateColorBook && (
					<Button
						className="add"
						color="secondary"
						disabled={disabled}
						onClick={this.handleClickAdd}
						title="Add colour book"
					>
						+ New colour book
					</Button>
				)}
			</div>
		);
	}

	renderColorBook() {
		const {
			canEdit,
			colorBookAdded,
			colorBooks,
			dispatch,
			handleEditColorBook,
			isEditingColorBook,
			onSelectColor,
		} = this.props;
		const { selectedColorBook, showAddColorBookForm } = this.state;

		const colorBook = colorBooks.find((obj) => obj._id === selectedColorBook);

		return colorBooks.length > 0
			? (
				<>
					{this.renderColorBookSelect()}
					{colorBook && (
						<ColorBook
							canEdit={canEdit}
							disabled={isEditingColorBook || showAddColorBookForm}
							isEditing={isEditingColorBook}
							colorBook={colorBook}
							colorBookAdded={colorBookAdded}
							dispatch={dispatch}
							handleEditColorBook={handleEditColorBook}
							key="color-book"
							onSelectColor={onSelectColor}
						/>
					)}
				</>
			)
			: (
				<p className="hint">You have no saved colour books</p>
			);
	}

	render() {
		const { showAddColorBookForm } = this.state;

		return (
			<div className="color-books">
				{this.renderColorBookButtons()}
				{showAddColorBookForm && this.renderNewColorBookPanel()}
				{this.renderColorBook()}
			</div>
		);
	}
}

ColorBooks.propTypes = {
	'canCreateColorBook': PropTypes.bool.isRequired,
	'canEdit': PropTypes.bool.isRequired,

	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleEditColorBook': PropTypes.func.isRequired,
	'isEditingColorBook': PropTypes.bool.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBooks;
