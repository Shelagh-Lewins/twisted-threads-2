// view and edit the user's color books

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { addColorBook, removeColorBook } from '../modules/colorBook';
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
		this.el.className = 'new-color-book-holder';
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

	handleClickDelete = () => {

	}

	// show the form to add a new color book
	handleClickAdd = () => {
		this.setState({
			'showAddColorBookForm': true,
		});
	}

	// actually add a new color book
	handleClickAddColorBook = ({ name }) => {
		const { dispatch } = this.props;

		dispatch(addColorBook(name));
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

		const response = confirm(`Do you want to delete the colour book "${name}"?`); // eslint-disable-line no-restricted-globals

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
		const { selectedColorBook } = this.state;

		return (
			<div className="select-color-book">
				Current colour book:&nbsp;
				<select
					disabled={isEditingColorBook}
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
				<AddColorBookForm
					handleCancel={this.cancelAddColorBook}
					handleSubmit={this.handleClickAddColorBook}
				/>,
				this.el,
			)
		);
	}

	renderColorBookButtons() {
		const {
			canCreateColorBook,
			canEdit,
			closeColorBooks,
			handleEditColorBook,
			isEditingColorBook,
		} = this.props;

		return (
			<div className="buttons-books">
				{canEdit && (
					<>
						<Button
							color="secondary"
							onClick={() => handleEditColorBook(true)}
							title="Edit"
						>
							Edit
						</Button>
						<Button
							color="danger"
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
						disabled={isEditingColorBook}
						onClick={this.handleClickAdd}
						title="Add colour book"
					>
						+ New colour book
					</Button>
				)}
				{/* <Button
					className="done"
					color="primary"
					onClick={closeColorBooks}
					title="Done"
				>
					Done
				</Button> */}
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
		const { selectedColorBook } = this.state;

		const colorBook = colorBooks.find((obj) => obj._id === selectedColorBook);

		return colorBooks.length > 0
			? (
				<>
					{this.renderColorBookSelect()}
					{colorBook && (
						<ColorBook
							canEdit={canEdit}
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
	'closeColorBooks': PropTypes.func.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleEditColorBook': PropTypes.func.isRequired,
	'isEditingColorBook': PropTypes.bool.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBooks;
