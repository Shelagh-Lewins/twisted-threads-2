import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { verifyEmail } from '../modules/auth';
import './AddColorBookForm.scss';

const validate = (values) => {
	const errors = {};

	if (!values.code) {
		errors.code = 'Required';
	}

	return errors;
};

const VerifyEmailForm = (props) => {
	const {
		dispatch,
	} = props;
	const handleSubmit = (values) => {
		const { code } = values;

		dispatch(verifyEmail(values.code));
	};

	const formik = useFormik({
		'initialValues': {
			'code': '',
		},
		validate,
		'onSubmit': (values) => {
			handleSubmit(values);
		},
	});

	return (
		<form onSubmit={formik.handleSubmit} className="verify-email-address-form">
			<div className="form-group">
				<label htmlFor="code">
					Enter the verification code that you received by email:
					<input
						className={`form-control ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''
						}`}
						placeholder="Enter verification code"
						id="code"
						name="code"
						type="text"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.code}
					/>
					{formik.touched.code && formik.errors.code ? (
						<div className="invalid-feedback invalid">{formik.errors.code}</div>
					) : null}
				</label>
			</div>
			<div className="controls">
				<Button type="submit" color="primary">Verify email address</Button>
			</div>
		</form>
	);
};

VerifyEmailForm.propTypes = {
	'dispatch': PropTypes.func.isRequired,
};

export default VerifyEmailForm;
