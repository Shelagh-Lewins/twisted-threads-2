import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
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

	return (
		<form onSubmit={formik.handleSubmit} className="add-color-book-form">
			<h2>Create a new colour book</h2>
			<p className="hint">A colour book is a collection of colour swatches which can be assigned to a pattern&apos;s working palette. You can define the colours in the next step.</p>
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
