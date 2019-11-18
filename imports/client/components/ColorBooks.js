// view and edit the user's color books

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { addColorBook } from '../modules/pattern';
import AddColorBookForm from './AddColorBookForm';
import './ColorBooks.scss';

// color books have nothing to identify them except index
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class ColorBooks extends PureComponent {
	constructor(props) {
		super(props);

		this.handleClickAddColorBook = this.handleClickAddColorBook.bind(this);
	}

	handleClickAddColorBook({ name }) {
		const { dispatch } = this.props;

		dispatch(addColorBook(name));
	}

	render() {
		const { colorBooks } = this.props;
		// TO DO hide add color book form behind a + button

		return (
			<div className="color-books">
				<AddColorBookForm
					handleSubmit={this.handleClickAddColorBook}
				/>
				<h2>Color books</h2>
				{colorBooks.map((colorBook, index) => (
					<div
						className="color-book"
						key={`color-book=${index}`}
					>
						{colorBook.name}
					</div>
				))}
			</div>
		);
	}
}

ColorBooks.propTypes = {
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'onChangeComplete': PropTypes.func,
	'onAccept': PropTypes.func,
	'onCancel': PropTypes.func,
};

export default ColorBooks;
