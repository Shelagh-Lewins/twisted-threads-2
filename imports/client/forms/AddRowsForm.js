// add rows to an 'individual' type pattern

import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	MAX_ROWS,
} from '../../modules/parameters';
import './AddRowsForm.scss';

const rowsInPairs = (patternType) => patternType === 'brokenTwill' || patternType === 'doubleFaced';

const validate = (values, numberOfRows, patternType) => {
	const errors = {};
	const { insertNRows, insertRowsAt } = values;

	if (!insertNRows) {
		errors.insertNRows = 'Required';
	} else if (insertNRows < 1) {
		errors.insertNRows = 'Must be at least 1';
	} else if (!Number.isInteger(insertNRows)) {
		errors.insertNRows = 'Must be a whole number';
	} else if (insertNRows > MAX_ROWS) {
		errors.insertNRows = `Number of rows in pattern cannot be greater than ${MAX_ROWS - numberOfRows}`;
	} else if (rowsInPairs(patternType)) {
		if (insertNRows % 2 !== 0) {
			errors.insertNRows = 'Must be an even number';
		} else if (insertNRows < 2) {
			errors.insertNRows = 'Must be at least 2';
		}
	}

	if (!insertRowsAt) {
		errors.insertRowsAt = 'Required';
	} else if (insertRowsAt < 1) {
		errors.insertRowsAt = 'Must be at least 1';
	} else if (insertRowsAt > numberOfRows) {
		errors.insertRowsAt = `Must not be greater than ${MAX_ROWS}`;
	} else if (!Number.isInteger(insertRowsAt)) {
		errors.insertRowsAt = 'Must be a whole number';
	} else if (rowsInPairs(patternType)) {
		if (insertRowsAt % 2 !== 1) {
			errors.insertNRows = 'Must be an odd number';
		}
	}

	return errors;
};

const AddRowsForm = (props) => {
	const { numberOfRows, patternType } = props;
	const initialNRows = rowsInPairs(patternType) ? 2 : 1;
	const stepNRows = rowsInPairs(patternType) ? 2 : 1;
	const stepInsertAt = rowsInPairs(patternType) ? 2 : 1;
	const minNRows = rowsInPairs(patternType) ? 2 : 1;

	const formik = useFormik({
		'initialValues': {
			'insertNRows': initialNRows,
			'insertRowsAt': numberOfRows + 1,
		},
		'validate': (values) => {
			validate(values, numberOfRows, patternType);
		},
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	// change initial values after removing a row
	if (numberOfRows + 1 !== formik.initialValues.insertRowsAt) {
		formik.resetForm({
			'values': {
				'insertNRows': initialNRows,
				'insertRowsAt': numberOfRows + 1,
			},
		});
	}

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	return (
		<div className="add-rows-form edit-pattern-form">
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					<label htmlFor="insertNRows">
						Add
						<input
							className={`form-control ${formik.touched.insertNRows && formik.errors.insertNRows ? 'is-invalid' : ''
							}`}
							placeholder="Number of rows"
							id="insertNRows"
							max={MAX_ROWS - numberOfRows}
							min={minNRows}
							name="insertNRows"
							step={stepNRows}
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
							step={stepInsertAt}
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
				</div>
			</form>
		</div>
	);
};

AddRowsForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'patternType': PropTypes.string,
};

export default AddRowsForm;
