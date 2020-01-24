// set number of rows in an 'allTogether' type pattern

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	MAX_ROWS,
} from '../../modules/parameters';
import './AllTogetherRowsForm.scss';

const validate = (values) => {
	const errors = {};
	if (!values.numberOfRows) {
		errors.numberOfRows = 'Required';
	} else if (values.numberOfRows < 1) {
		errors.numberOfRows = 'Must be at least 1';
	} else if (!Number.isInteger(values.numberOfRows)) {
		errors.insertNRows = 'Must be a whole number';
	} else if (values.numberOfRows > MAX_ROWS) {
		errors.numberOfRows = `Cannot be greater than ${MAX_ROWS}`;
	}

	return errors;
};

const AllTogetherRowsForm = (props) => {
	const {
		disabled,
		numberOfRows,
	} = props;

	let setFieldValue;

	const handleChangeNumberOfTablets = (e) => {
		const { value } = e.target;

		setFieldValue('numberOfRows', value);

		clearTimeout(global.allTogetherRowsTimeout);

		global.allTogetherRowsTimeout = setTimeout(() => {
			props.handleSubmit(value);
		}, 800);
	};

	const formik = useFormik({
		'initialValues': {
			numberOfRows,
		},
		'validate': (values) => {
			validate(values, numberOfRows);
		},
		'onSubmit': () => {},
	});

	setFieldValue = formik.setFieldValue;

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	return (
		<div className="all-together-rows-form">
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					Number of weaving rows:
					<label htmlFor="numberOfRows">
						Number of weaving rows
						<input
							className={`form-control ${formik.touched.numberOfRows && formik.errors.numberOfRows ? 'is-invalid' : ''
							}`}
							disabled={disabled}
							placeholder="Number of rows"
							id="numberOfRows"
							max={MAX_ROWS}
							min="1"
							name="numberOfRows"
							type="number"
							onChange={handleChangeNumberOfTablets}
							onBlur={formik.handleBlur}
							value={formik.values.numberOfRows}
						/>
						{formik.touched.numberOfRows && formik.errors.numberOfRows ? (
							<div className="invalid-feedback invalid">{formik.errors.numberOfRows}</div>
						) : null}
					</label>
					(max {MAX_ROWS})
					<div className="controls">
						<Button type="submit" color="primary">Add rows</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

AllTogetherRowsForm.propTypes = {
	'disabled': PropTypes.bool.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
};

export default AllTogetherRowsForm;
