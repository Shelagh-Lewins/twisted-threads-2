// view and edit the user's color books

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { addColorBook, removeColorBook, setColorBookAdded } from '../modules/colorBook';
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

		// bind onClick functions to provide context
		const functionsToBind = [
			'cancelAddColorBook',
			'handleClickAddButton',
			'handleClickAddColorBook',
			'handleClickRemoveColorBook',
			'handleChangeColorBook',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidUpdate(prevProps) {
		const { colorBookAdded, dispatch } = this.props;

		// automatically select a new color book
		if (prevProps.colorBookAdded === '' && colorBookAdded !== '') {
			this.setState({ // eslint-disable-line react/no-did-update-set-state
				'selectedColorBook': colorBookAdded,
			});
			dispatch(setColorBookAdded(''));
		}
	}

	// show the form to add a new color book
	handleClickAddButton() {
		this.setState({
			'showAddColorBookForm': true,
		});
	}

	// actually add a new color book
	handleClickAddColorBook({ name }) {
		const { dispatch } = this.props;

		dispatch(addColorBook(name));
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	// hide the add color book form and take no action
	cancelAddColorBook() {
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	handleClickRemoveColorBook({ _id, name }) {
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

	handleChangeColorBook(event) {
		this.setState({
			'selectedColorBook': event.target.value,
		});
	}

	renderColorBookSelect() {
		const { colorBooks } = this.props;
		const { selectedColorBook } = this.state;

		return (
			<div className="select-color-book">
				Colour book:&nbsp;
				<select
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

	render() {
		const {
			canCreateColorBook,
			canEdit,
			cancelColorChange,
			colorBooks,
			dispatch,
			handleEditColorBookColors,
			onSelectColor,
		} = this.props;

		const { selectedColorBook, showAddColorBookForm } = this.state;
		const addButton = (
			<Button
				className="add"
				color="secondary"
				onClick={this.handleClickAddButton}
				title="Add colour book"
			>
				+ New colour book
			</Button>
		);

		const closeButton = (
			<Button
				className="close"
				color="secondary"
				onClick={cancelColorChange}
				title="Close"
			>
				X
			</Button>
		);

		const colorBook = colorBooks.find((obj) => obj._id === selectedColorBook);

		const colorBookElms = colorBook
			? (
				[
					this.renderColorBookSelect(),
					<ColorBook
						canEdit={canEdit}
						colorBook={colorBook}
						dispatch={dispatch}
						handleEditColorBookColors={handleEditColorBookColors}
						key="color-book"
						onSelectColor={onSelectColor}
						handleClickRemoveColorBook={this.handleClickRemoveColorBook}
					/>]
			)
			: (
				<p className="hint">You have no saved colour books</p>
			);

		return (
			<div className="color-books">
				{canCreateColorBook && !showAddColorBookForm && addButton}
				{closeButton}
				{showAddColorBookForm && (
					<AddColorBookForm
						handleCancel={this.cancelAddColorBook}
						handleSubmit={this.handleClickAddColorBook}
					/>
				)}
				{!showAddColorBookForm && colorBookElms}
			</div>
		);
	}
}

ColorBooks.propTypes = {
	'canCreateColorBook': PropTypes.bool.isRequired,
	'canEdit': PropTypes.bool.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'cancelColorChange': PropTypes.func.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleEditColorBookColors': PropTypes.func.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBooks;
