import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const validate = (values) => {
	const errors = {};

	if (!values.oldPassword) {
		errors.oldPassword = 'Required';
	} else if (/\s/.test(values.oldPassword)) {
		errors.oldPassword = 'Must not contain spaces';
	} else if (values.oldPassword.length < 8) {
		errors.oldPassword = 'Must be at least 8 characters';
	}

	if (!values.newPassword) {
		errors.newPassword = 'Required';
	} else if (/\s/.test(values.newPassword)) {
		errors.newPassword = 'Must not contain spaces';
	} else if (values.newPassword.length < 8) {
		errors.newPassword = 'Must be at least 8 characters';
	}

	if (!values.confirmNewPassword) {
		errors.confirmNewPassword = 'Required';
	} else if (/\s/.test(values.confirmNewPassword)) {
		errors.confirmNewPassword = 'Must not contain spaces';
	} else if (values.confirmNewPassword.length < 8) {
		errors.confirmNewPassword = 'Must be at least 8 characters';
	} else if (values.newPassword !== values.confirmNewPassword) {
		errors.confirmNewPassword = 'Passwords must match';
	}

	return errors;
};

const ChangePasswordForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'confirmNewPassword': '',
			'newPassword': '',
			'oldPassword': '',
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
					Old password
					<input
						className={`form-control ${formik.touched.oldPassword &&	formik.errors.oldPassword ? 'is-invalid' : ''
						}`}
						placeholder="Old password"
						id="oldPassword"
						name="oldPassword"
						type="password"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.oldPassword}
					/>
					{formik.touched.oldPassword && formik.errors.oldPassword ? (
						<div className="invalid-feedback invalid">{formik.errors.oldPassword}</div>
					) : null}
				</label>
			</div>
			<div className="form-group">
				<label htmlFor="newPassword">
					New password
					<input
						className={`form-control ${formik.touched.newPassword &&	formik.errors.newPassword ? 'is-invalid' : ''
						}`}
						placeholder="New password"
						id="newPassword"
						name="newPassword"
						type="password"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.newPassword}
					/>
					{formik.touched.newPassword && formik.errors.newPassword ? (
						<div className="invalid-feedback invalid">{formik.errors.newPassword}</div>
					) : null}
				</label>
			</div>
			<div className="form-group">
				<label htmlFor="confirmNewPassword">
					Confirm password
					<input
						className={`form-control ${formik.touched.confirmNewPassword && formik.errors.confirmNewPassword ? 'is-invalid' : ''
						}`}
						placeholder="Confirm password"
						id="confirmNewPassword"
						name="confirmNewPassword"
						type="password"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.confirmNewPassword}
					/>
					{formik.touched.confirmNewPassword && formik.errors.confirmNewPassword ? (
						<div className="invalid-feedback invalid">{formik.errors.confirmNewPassword}</div>
					) : null}
				</label>
			</div>
			<Button type="submit" color="primary">Change password</Button>
		</form>
	);
};

ChangePasswordForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default ChangePasswordForm;
