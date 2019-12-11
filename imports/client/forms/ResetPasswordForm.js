import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const validate = (values) => {
	const errors = {};

	if (!values.password) {
		errors.password = 'Required';
	} else if (/\s/.test(values.password)) {
		errors.password = 'Must not contain spaces';
	} else if (values.password.length < 8) {
		errors.password = 'Must be at least 8 characters';
	}

	if (!values.confirmPassword) {
		errors.confirmPassword = 'Required';
	} else if (/\s/.test(values.confirmPassword)) {
		errors.confirmPassword = 'Must not contain spaces';
	} else if (values.confirmPassword.length < 8) {
		errors.confirmPassword = 'Must be at least 8 characters';
	} else if (values.password !== values.confirmPassword) {
		errors.confirmPassword = 'Passwords must match';
	}

	return errors;
};

const ResetPasswordForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'confirmPassword': '',
			'password': '',

		},
		validate,
		'onSubmit': (values) => {
			props.handleSubmit(values);
		},
	});

	return (
		<form onSubmit={formik.handleSubmit}>
			<div className="form-group">
				<label htmlFor="password">
					New password
					<input
						className={`form-control ${formik.touched.password &&	formik.errors.password ? 'is-invalid' : ''
						}`}
						placeholder="New password"
						id="password"
						name="password"
						type="password"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.password}
					/>
					{formik.touched.password && formik.errors.password ? (
						<div className="invalid-feedback invalid">{formik.errors.password}</div>
					) : null}
				</label>
			</div>
			<div className="form-group">
				<label htmlFor="confirmPassword">
					Confirm password
					<input
						className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''
						}`}
						placeholder="Confirm password"
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.confirmPassword}
					/>
					{formik.touched.confirmPassword && formik.errors.confirmPassword ? (
						<div className="invalid-feedback invalid">{formik.errors.confirmPassword}</div>
					) : null}
				</label>
			</div>
			<Button type="submit" color="primary">Reset password</Button>
		</form>
	);
};

ResetPasswordForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default ResetPasswordForm;
