// view and edit the user's color books

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { addColorBook, setColorBookAdded } from '../modules/colorBook';
import AddColorBookForm from './AddColorBookForm';
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
			'handleChangeColorBook',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidUpdate(prevProps) {
		const { colorBookAdded, dispatch } = this.props;

		if (prevProps.colorBookAdded === '' && colorBookAdded !== '') {
			this.setState({ // eslint-disable-line react/no-did-update-set-state
				'selectedColorBook': colorBookAdded,
			});
			dispatch(setColorBookAdded(''));
		}
	}

	handleClickAddButton() {
		this.setState({
			'showAddColorBookForm': true,
		});
	}

	handleClickAddColorBook({ name }) {
		const { dispatch } = this.props;

		dispatch(addColorBook(name));
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	cancelAddColorBook() {
		this.setState({
			'showAddColorBookForm': false,
		});
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
			<select
				className="select-color-book"
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
		);
	}

	render() {
		const {
			cancelColorChange,
			colorBooks,
			dispatch,
			onSelectColor,
		} = this.props;

		const { selectedColorBook, showAddColorBookForm } = this.state;
		const addButton = (
			<Button
				className="add"
				color="secondary"
				onClick={this.handleClickAddButton}
				title="Add color book"
			>
				Add color book
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

		const colorBookElms = colorBooks.length > 0
			? (
				[
					this.renderColorBookSelect(),
					<ColorBook
						colorBook={colorBooks.find((obj) => obj._id === selectedColorBook)}
						dispatch={dispatch}
						key="color-book"
						onSelectColor={onSelectColor}
					/>]
			)
			: (
				<p className="hint">You have no saved color books</p>
			);

		return (
			<div className="color-books">
				{!showAddColorBookForm && addButton}
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
	'colorBookAdded': PropTypes.string.isRequired,
	'cancelColorChange': PropTypes.func.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBooks;
