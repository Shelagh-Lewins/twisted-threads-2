import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const validate = (optional, values) => {
	const errors = {};

	if (!values.fieldValue && !optional) {
		errors.fieldValue = 'Required';
	}

	return errors;
};

const EditableTextForm = (props) => {
	const {
		fieldValue,
		optional,
		type,
	} = props;
	const formik = useFormik({
		'initialValues': {
			'fieldValue': fieldValue,
		},
		'validate': (values) => validate(optional, values),
		'onSubmit': (values) => {
			props.handleSubmit(values);
		},
	});

	const { handleCancel, title } = props;

	let fieldElement;

	switch (type) {
		case 'input':
			fieldElement = (
				<input
					className={`form-control ${formik.touched.fieldValue && formik.errors.fieldValue ? 'is-invalid' : ''
					}`}
					placeholder={title}
					id="fieldValue"
					name="fieldValue"
					type="text"
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					value={formik.values.fieldValue}
				/>
			);
			break;

		case 'textarea':
			fieldElement = (
				<textarea
					className={`form-control ${formik.touched.fieldValue && formik.errors.fieldValue ? 'is-invalid' : ''
					}`}
					placeholder={title}
					id="fieldValue"
					name="fieldValue"
					rows={8}
					type="text"
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					value={formik.values.fieldValue}
				/>
			);
			break;

		default:
			break;
	}

	return (
		<form onSubmit={formik.handleSubmit} className="edit-text-field-form">
			<div className="form-group">
				<label htmlFor="fieldValue">
					{title}
					{fieldElement}
					{formik.touched.fieldValue && formik.errors.fieldValue ? (
						<div className="invalid-feedback invalid">{formik.errors.fieldValue}</div>
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

EditableTextForm.defaultProps = {
	'fieldValue': '',
};

EditableTextForm.propTypes = {
	'fieldValue': PropTypes.string,
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'optional': PropTypes.bool,
	'title': PropTypes.string.isRequired,
	'type': PropTypes.string.isRequired,
};

export default EditableTextForm;
