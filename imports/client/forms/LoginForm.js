import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const validate = (values) => {
	const errors = {};
	// this may be username or email address
	if (!values.user) {
		errors.username = 'Required';
	} else if (/\s/.test(values.username)) {
		errors.username = 'Must not contain spaces';
	}

	if (!values.password) {
		errors.password = 'Required';
	} else if (/\s/.test(values.password)) {
		errors.password = 'Must not contain spaces';
	}

	return errors;
};

const LoginForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'user': '',
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
				<label htmlFor="user">
					Email Address or username
					<input
						className={`form-control ${formik.touched.user && formik.errors.user ? 'is-invalid' : ''
						}`}
						placeholder="Email address or username"
						id="user"
						name="user"
						type="text"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.user}
					/>
					{formik.touched.user && formik.errors.user ? (
						<div className="invalid-feedback invalid">{formik.errors.user}</div>
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
			<Button type="submit" color="primary">Login</Button>
		</form>
	);
};

LoginForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default LoginForm;
