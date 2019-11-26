// add rows to an 'individual' type pattern

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	MAX_ROWS_TO_ADD,
	MAX_ROWS,
} from '../../modules/parameters';
import './AddPatternForm.scss';

const validate = (values, numberOfRows) => {
	const errors = {};
	if (!values.insertNRows) {
		errors.insertNRows = 'Required';
	} else if (values.insertNRows < 1) {
		errors.insertNRows = 'Must be at least 1';
	} else if (values.insertNRows > MAX_ROWS_TO_ADD) {
		errors.insertNRows = `Must not be greater than ${MAX_ROWS_TO_ADD}`;
	} else if (!Number.isInteger(values.insertNRows)) {
		errors.insertNRows = 'Must be a whole number';
	} else if (values.insertNRows > MAX_ROWS) {
		errors.insertNRows = `Number of rows in pattern cannot be greater than ${MAX_ROWS - numberOfRows}`;
	}

	if (!values.insertRowsAt) {
		errors.insertRowsAt = 'Required';
	} else if (values.insertRowsAt < 1) {
		errors.insertRowsAt = 'Must be at least 1';
	} else if (values.insertRowsAt > numberOfRows) { // TODO replace with current number of rows
		errors.insertRowsAt = `Must not be greater than ${MAX_ROWS}`;
	} else if (!Number.isInteger(values.insertRowsAt)) {
		errors.insertRowsAt = 'Must be a whole number';
	}

	return errors;
};

const AddRowsForm = (props) => {
	const { numberOfRows } = props;
	const formik = useFormik({
		'initialValues': {
			'insertNRows': 1,
			'insertRowsAt': numberOfRows + 1,
		},
		'validate': (values) => {
			validate(values, numberOfRows);
		},
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	// change initial values after removing a row
	if (numberOfRows + 1 !== formik.initialValues.insertRowsAt) {
		formik.resetForm({
			'values': {
				'insertNRows': 1,
				'insertRowsAt': numberOfRows + 1,
			},
		});
	}

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	return (
		<div className="edit-pattern-form">
			<form onSubmit={formik.handleSubmit}>
				<Row className="form-group">
					<Col>
						<label htmlFor="insertNRows">
							Add
							<input
								className={`form-control ${formik.touched.insertNRows && formik.errors.insertNRows ? 'is-invalid' : ''
								}`}
								placeholder="Number of rows"
								id="insertNRows"
								max={MAX_ROWS - numberOfRows}
								min="1"
								name="insertNRows"
								type="number"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.insertNRows}
							/>
							{formik.touched.insertNRows && formik.errors.insertNRows ? (
								<div className="invalid-feedback invalid">{formik.errors.insertNRows}</div>
							) : null}
						</label>
						<label htmlFor="insertRowsAt">
							rows at:
							<input
								className={`form-control ${formik.touched.insertRowsAt && formik.errors.insertRowsAt ? 'is-invalid' : ''
								}`}
								placeholder="Position to insert rows"
								id="insertRowsAt"
								max={numberOfRows + 1}
								min="1"
								name="insertRowsAt"
								type="number"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.insertRowsAt}
							/>
							{formik.touched.tablets && formik.errors.tablets ? (
								<div className="invalid-feedback invalid">{formik.errors.tablets}</div>
							) : null}
						</label>
						<div className="controls">
							<Button type="submit" color="primary">Add rows</Button>
						</div>
					</Col>
				</Row>
			</form>
		</div>
	);
};

AddRowsForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
};

export default AddRowsForm;
