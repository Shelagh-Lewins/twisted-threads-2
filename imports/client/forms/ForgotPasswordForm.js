import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const validate = (values) => {
	const errors = {};
	// this may be username or email address
	if (!values.email) {
		errors.email = 'Required';
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
		// don't overcomplicate email validation by specifying allowed characters; it's too easy to miss out a valid character like _ and refuse valid addresses
		// this regex requires exactly one @ symbol
		// and x.x after it, so x@x.x
		// and forbids spaces
		// https://tylermcginnis.com/validate-email-address-javascript/
		errors.email = 'Invalid email address';
	}

	return errors;
};

const ForgotPasswordForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'email': '',
		},
		validate,
		'onSubmit': (values) => {
			props.handleSubmit(values);
		},
	});

	return (
		<form onSubmit={formik.handleSubmit}>
			<div className="form-group">
				<label htmlFor="email">
					Email Address
					<input
						className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''
						}`}
						placeholder="Email address"
						id="email"
						name="email"
						type="email"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.email}
					/>
					{formik.touched.email && formik.errors.email ? (
						<div className="invalid-feedback invalid">{formik.errors.email}</div>
					) : null}
				</label>
			</div>
			<Button type="submit" color="primary">Send a reset password email</Button>
		</form>
	);
};

ForgotPasswordForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default ForgotPasswordForm;
