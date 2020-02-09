// set number of rows in an 'allTogether' type pattern

import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import validateInteger from '../modules/validateInteger';
import {
	MAX_ROWS,
} from '../../modules/parameters';
import './AllTogetherRowsForm.scss';

// much jiggery-pokery enables a form that updates immediately on change, with no submit button, but validates before submitting

const AllTogetherRowsForm = (props) => {
	const {
		canEdit,
		numberOfRows,
	} = props;

	const validate = (values) => {
		const errors = {};

		const numberOfRowsError = validateInteger({
			'max': MAX_ROWS,
			'min': 1,
			'value': values.numberOfRows,
		});

		if (numberOfRowsError) {
			errors.numberOfRows = numberOfRowsError;
		}

		return errors;
	};

	const formik = useFormik({
		'initialValues': {
			numberOfRows,
		},
		validate,
		'onSubmit': () => {},
	});

	const { setFieldValue } = formik;
	global.allTogetherRowsErrors = formik.errors; // formik.errors is not updated in the timeout but the global var is

	const handleChangeNumberOfRows = (e) => {
		const { value } = e.target;

		setFieldValue('numberOfRows', value);

		clearTimeout(global.allTogetherRowsTimeout);

		global.allTogetherRowsTimeout = setTimeout(() => {
			if (Object.keys(global.allTogetherRowsErrors).length === 0) {
				props.handleSubmit(value);
			}
		}, 800);
	};

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
							disabled={!canEdit}
							placeholder="Number of rows"
							id="numberOfRows"
							max={MAX_ROWS}
							min="1"
							name="numberOfRows"
							type="number"
							onChange={handleChangeNumberOfRows}
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
	'canEdit': PropTypes.bool.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
};

export default AllTogetherRowsForm;
