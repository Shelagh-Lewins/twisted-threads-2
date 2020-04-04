import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { COLORS_IN_COLOR_BOOK, DEFAULT_COLOR_BOOK_COLOR } from '../../modules/parameters';
import './AddColorBookForm.scss';
import '../components/ColorBook.scss';

// for accessibility we need to move focus into the floating panel
/* eslint-disable jsx-a11y/no-autofocus */

const validate = (values) => {
	const errors = {};

	if (!values.name) {
		errors.name = 'Required';
	}

	return errors;
};

const BasicForm = (props) => {
	const {
		handleCancel,
		handleClickColor,
		higherHandleSubmit,
		selectedColorIndex,
	} = props;

	const renderSwatches = (handleChange) => {
		const swatches = [];

		for (let i = 0; i < COLORS_IN_COLOR_BOOK; i += 1) {
			const identifier = `swatch-${i}`;
			const color = DEFAULT_COLOR_BOOK_COLOR;

			swatches.push((
				<label
					className={`color ${(selectedColorIndex === i) ? 'selected' : ''}`}
					key={identifier}
				>
					<input
						id={identifier}
						name={identifier}
						onClick={() => handleClickColor(i)}
						onKeyPress={() => handleClickColor(i)}
						type="text"
						onChange={handleChange}
						readOnly="readonly"
						value={color}
					/>
				</label>
			));
		}
		return (
			<div className="form-group color-book">
				<div className="colors">
					{swatches}
				</div>
			</div>
		);
	};
	return (
		<Formik
			initialValues={{ 'name': '' }}
			onSubmit={(values) => {
				console.log('values', values);
				higherHandleSubmit(values);
			}}
			validate={validate}
			validateOnBlur={false}
		>
			{({
				handleBlur,
				handleChange,
				handleSubmit,
				errors,
				touched,
				values,
			}) => {
				return (
					<form onSubmit={handleSubmit} className="add-color-book-form">
						<h2>New colour book</h2>
						<p className="hint">Define a set of colour swatches which can be assigned to any pattern&apos;s working palette.</p>
						<div className="form-group">
							<label htmlFor="name">
								Name
								<input
									autoFocus="autofocus"
									className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''
									}`}
									placeholder="Name"
									id="name"
									name="name"
									type="text"
									onChange={handleChange}
									onBlur={handleBlur}
									value={values.name}
								/>
								{touched.name && errors.name ? (
									<div className="invalid-feedback invalid">{errors.name}</div>
								) : null}
							</label>
						</div>
						{renderSwatches(handleChange)}
						<div className="controls">
							<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
							<Button type="submit" color="primary">Create</Button>
						</div>
					</form>
				);
			}}
		</Formik>
	);
};

BasicForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleClickColor': PropTypes.func.isRequired,
	'higherHandleSubmit': PropTypes.func.isRequired,
	'selectedColorIndex': PropTypes.number.isRequired,
};

class AddColorBookForm extends Component {
	// Color picker is rendered to the body element
	// so it can be positioned within the viewport
	constructor(props) {
		super(props);

		this.state = {
			'selectedColorIndex': 0,
		};
	}

	handleClickColor = (i) => {
		this.setState({
			'selectedColorIndex': i,
		});
	};

	render() {
		const { handleCancel, handleSubmit } = this.props;
		const { selectedColorIndex } = this.state;

		// handleSubmit is a property of Formik
		// so use a different name for the action function passed in here

		return (
			<BasicForm
				handleCancel={handleCancel}
				handleClickColor={this.handleClickColor}
				higherHandleSubmit={handleSubmit}
				selectedColorIndex={selectedColorIndex}
			/>
		);
	}
}

AddColorBookForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
};

export default AddColorBookForm;
