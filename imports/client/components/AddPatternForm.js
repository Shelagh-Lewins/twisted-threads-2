import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const validate = (values) => {
	const errors = {};

	if (!values.name) {
		errors.name = 'Required';
	}

	return errors;
};

const AddPatternForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'name': '',
		},
		validate,
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	return (
		<form onSubmit={formik.handleSubmit}>
			<div className="form-group">
				<label htmlFor="name">
					New pattern
					<input
						className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''
						}`}
						placeholder="Pattern name"
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
			<Button type="submit" color="primary">Create a new pattern</Button>
		</form>
	);
};

AddPatternForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default connect()(AddPatternForm);
