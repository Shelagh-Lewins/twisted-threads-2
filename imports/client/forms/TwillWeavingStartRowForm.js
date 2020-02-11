// add rows to an 'individual' type pattern

import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import validateInteger from '../modules/validateInteger';
import './TwillWeavingStartRowForm.scss';

// much jiggery-pokery enables a form that updates immediately on change, with no submit button, but validates before submitting

const TwillWeavingStartRowForm = (props) => {
	const {
		numberOfRows,
		weavingStartRow,
	} = props;

	// this location necessary for validate to work with extra params e.g. chartLength
	const validate = (values) => {
		const errors = {};

		const weavingStartRowError = validateInteger({
			'max': numberOfRows,
			'min': 1,
			'odd': true,
			'value': values.weavingStartRow,
		});

		if (weavingStartRowError) {
			errors.weavingStartRow = weavingStartRowError;
		}

		return errors;
	};

	const formik = useFormik({
		'initialValues': {
			weavingStartRow,
		},
		validate,
		'onSubmit': () => {},
	});

	const { setFieldValue } = formik;
	global.twillStartRowErrors = formik.errors; // formik.errors is not updated in the timeout but the global var is

	const handleChangeweavingStartRow = (e) => {
		const { value } = e.target;

		setFieldValue('weavingStartRow', value);

		clearTimeout(global.twillStartRowTimeout);

		global.twillStartRowTimeout = setTimeout(() => {
			if (Object.keys(global.twillStartRowErrors).length === 0) {
				props.handleSubmit(value);
			}
		}, 800);
	};

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	return (
		<div className="twill-start-row-form edit-pattern-form">
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					<label htmlFor="weavingStartRow">
						Start weaving from row:
						<input
							className={`form-control ${formik.touched.weavingStartRow && formik.errors.weavingStartRow ? 'is-invalid' : ''
							}`}
							placeholder="Number of rows"
							id="weavingStartRow"
							max={numberOfRows}
							min="1"
							name="weavingStartRow"
							step="2"
							type="number"
							onChange={handleChangeweavingStartRow}
							onBlur={formik.handleBlur}
							value={formik.values.weavingStartRow}
						/>
						{formik.touched.weavingStartRow && formik.errors.weavingStartRow ? (
							<div className="invalid-feedback invalid">{formik.errors.weavingStartRow}</div>
						) : null}
					</label>
					<div className="controls">
						<Button type="submit" color="primary">Set start row</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

TwillWeavingStartRowForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'weavingStartRow': PropTypes.number.isRequired,
};

export default TwillWeavingStartRowForm;
