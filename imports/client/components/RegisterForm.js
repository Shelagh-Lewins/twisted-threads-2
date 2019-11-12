import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const validate = (values) => {
	const errors = {};
	if (!values.username) {
		errors.username = 'Required';
	} else if (/\s/.test(values.username)) {
		errors.username = 'Must not contain spaces';
	} else if (/@/.test(values.username)) {
		errors.username = 'Must not contain @ symbol';
	}

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

const RegisterForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'confirmPassword': '',
			'email': '',
			'password': '',
			'username': '',
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
					Email Address (this will never be displayed)
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
			<div className="form-group">
				<label htmlFor="username">
					Username (this may be displayed)
					<input
						className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''
						}`}
						placeholder="Username"
						id="username"
						name="username"
						type="text"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.username}
					/>
					{formik.touched.username && formik.errors.username ? (
						<div className="invalid-feedback">{formik.errors.username}</div>
					) : null}
				</label>
			</div>
			<div className="form-group">
				<label htmlFor="password">
					Password
					<input
						className={`form-control ${formik.touched.password &&	formik.errors.password ? 'is-invalid' : ''
						}`}
						placeholder="Password"
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
			<Button type="submit" color="primary">Create an account</Button>
		</form>
	);
};

RegisterForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default RegisterForm;
