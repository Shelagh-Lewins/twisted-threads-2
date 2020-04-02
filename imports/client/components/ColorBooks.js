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
			'isEditing': false, // is editing the current color book
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

	// show the form to add a new color book
	handleClickAddButton = () => {
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

	handleClickRemoveColorBook = ({ _id, name }) => {
		const { colorBooks, dispatch } = this.props;
		const response = confirm(`Do you want to delete the colour book "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			// deselect the removed color book
			let newSelection;
			if (colorBooks.length === 1) { // there will be no remaining color books
				newSelection = '';
			} else if (colorBooks[0]._id === _id) {
				newSelection = colorBooks[1]._id; // eslint-disable-line prefer-destructuring
			} else {
				newSelection = colorBooks[0]._id; // eslint-disable-line prefer-destructuring
			}

			this.setState({
				'selectedColorBook': newSelection,
			});

			dispatch(removeColorBook(_id));
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

	render() {
		const {
			canCreateColorBook,
			canEdit,
			closeColorBooks,
			colorBookAdded,
			colorBooks,
			dispatch,
			handleEditColorBook,
			isEditingColorBook,
			onSelectColor,
		} = this.props;

		const { selectedColorBook, showAddColorBookForm } = this.state;
		const colorBookButtons = (
			<div className="buttons-books">
				{canCreateColorBook && (
					<>
						<Button
							color="secondary"
							onClick={this.handleClickEditButton}
							title="Edit"
						>
							Edit
						</Button>
						<Button
							color="danger"
							onClick={this.handleClickDeleteButton}
							title="Delete"
						>
							Delete
						</Button>
						<Button
							className="add"
							color="secondary"
							disabled={isEditingColorBook}
							onClick={this.handleClickAddButton}
							title="Add colour book"
						>
							+ New colour book
						</Button>
					</>
				)}
				<Button
					className="done"
					color="primary"
					onClick={closeColorBooks}
					title="Done"
				>
					Done
				</Button>
			</div>
		);

		const colorBook = colorBooks.find((obj) => obj._id === selectedColorBook);

		const colorBookElms = colorBooks.length > 0
			? (
				<>
					{this.renderColorBookSelect()}
					{colorBook && (
						<ColorBook
							canEdit={canEdit}
							colorBook={colorBook}
							colorBookAdded={colorBookAdded}
							dispatch={dispatch}
							handleEditColorBook={handleEditColorBook}
							key="color-book"
							onSelectColor={onSelectColor}
							handleClickRemoveColorBook={this.handleClickRemoveColorBook}
						/>
					)}
				</>
			)
			: (
				<p className="hint">You have no saved colour books</p>
			);

		return (
			<div className="color-books">
				{colorBookButtons}
				{showAddColorBookForm && this.renderNewColorBookPanel()}
				{colorBookElms}
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
