// add rows to an 'individual' type pattern

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {

	MAX_TABLETS,
} from '../../modules/parameters';
import './AddPatternForm.scss';

const validate = (values) => {
	const errors = {};
console.log('validate values', values);

	// can be null, that means no limit
	if (values.minTablets) {
		const minTablets = parseFloat(values.minTablets, 10);
		if (minTablets < 1) {
			errors.minTablets = 'Must be at least 1';
		} else if (minTablets > MAX_TABLETS) {
			errors.minTablets = `Must not be greater than ${MAX_TABLETS}`;
		} else if (!Number.isInteger(minTablets)) {
			errors.minTablets = 'Must be a whole number';
		}
	}

	// can be null, that means no limit
	if (values.maxTablets) {
		const maxTablets = parseFloat(values.maxTablets, 10);
		if (maxTablets < 1) {
			errors.maxTablets = 'Must be at least 1';
		} else if (maxTablets > MAX_TABLETS) {
			errors.maxTablets = `Must not be greater than ${MAX_TABLETS}`;
		} else if (!Number.isInteger(maxTablets)) {
			errors.maxTablets = 'Must be a whole number';
		} else if (maxTablets <= values.minTablets) {
			errors.maxTablets = 'Must be > minimum tablets';
		}
	}

	return errors;
};

const handleSubmit = (values) => {
		console.log('submit', values);
	};

const TabletFilterForm = (props) => {
	const { numberOfRows } = props;
	const formik = useFormik({
		'initialValues': {
			'minTablets': 1,
			'maxTablets': 2,
		},
		validate,
		'onSubmit': (values) => {
			handleSubmit(values);
		},
	});

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	return (
		<div className="tablet-filter-form">
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					<label htmlFor="minTablets">
						Add
						<input
							className={`form-control ${formik.touched.minTablets && formik.errors.minTablets ? 'is-invalid' : ''
							}`}
							placeholder="Min"
							id="minTablets"
							max={MAX_TABLETS}
							min="1"
							name="minTablets"
							type="number"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.minTablets && formik.errors.minTablets ? (
							<div className="invalid-feedback invalid">{formik.errors.minTablets}</div>
						) : null}
					</label>
					<label htmlFor="maxTablets">
						rows at:
						<input
							className={`form-control ${formik.touched.maxTablets && formik.errors.maxTablets ? 'is-invalid' : ''
							}`}
							placeholder="Position to insert rows"
							id="maxTablets"
							max={MAX_TABLETS}
							min="1"
							name="maxTablets"
							type="number"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.maxTablets && formik.errors.maxTablets ? (
							<div className="invalid-feedback invalid">{formik.errors.maxTablets}</div>
						) : null}
					</label>
					<div className="controls">
						<Button type="submit" color="primary">Update</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

TabletFilterForm.propTypes = {
	'minTablets': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
};

export default TabletFilterForm;
