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

const EditColorBookNameForm = (props) => {
	const { name } = props;
	const formik = useFormik({
		'initialValues': {
			'name': name,
		},
		validate,
		'onSubmit': (values) => {
			props.handleSubmit(values);
		},
	});

	const { handleCancel } = props;

	return (
		<form onSubmit={formik.handleSubmit} className="add-color-book-form">
			<h2>Edit color book name</h2>
			<div className="form-group">
				<label htmlFor="name">
					Name
					<input
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
				<Button type="submit" color="primary">Save</Button>
			</div>
		</form>
	);
};

EditColorBookNameForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
};

export default EditColorBookNameForm;
