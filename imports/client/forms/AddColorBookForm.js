import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { COLORS_IN_COLOR_BOOK, DEFAULT_COLOR_BOOK_COLOR } from '../../modules/parameters';
import './AddColorBookForm.scss';

const validate = (values) => {
	const errors = {};

	if (!values.name) {
		errors.name = 'Required';
	}

	return errors;
};

const AddColorBookForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'name': '',
		},
		validate,
		'onSubmit': (values) => {
			props.handleSubmit(values);
		},
		'validateOnBlur': false,
	});

	const { handleCancel } = props;

	const renderSwatches = () => {
		const swatches = [];

		for (let i = 0; i < COLORS_IN_COLOR_BOOK; i += 1) {
			const identifier = `swatch-${i}`;
			swatches.push((
				<label
					key={identifier}
				>
					<input
						id={identifier}
						name={identifier}
						type="text"
						onChange={formik.handleChange}
						value={DEFAULT_COLOR_BOOK_COLOR}
					/>
				</label>
			));
		}
		return (
			<div className="form-group">
				{swatches}
			</div>
		);
	};

	return (
		<form onSubmit={formik.handleSubmit} className="add-color-book-form">
			<h2>New colour book</h2>
			<p className="hint">Define a set of colour swatches which can be assigned to any pattern&apos;s working palette.</p>
			<div className="form-group">
				<label htmlFor="name">
					Name
					<input
						autoFocus="autofocus"
						className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''
						}`}
						placeholder="Name"
						id="name"
						name="name"
						type="text"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.name}
					/>
					{formik.touched.name && formik.errors.name ? (
						<div className="invalid-feedback invalid">{formik.errors.name}</div>
					) : null}
				</label>
			</div>
			{renderSwatches()}
			<div className="controls">
				<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
				<Button type="submit" color="primary">Create</Button>
			</div>
		</form>
	);
};

AddColorBookForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
};

export default AddColorBookForm;
