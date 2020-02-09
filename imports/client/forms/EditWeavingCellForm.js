import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import validateInteger from '../modules/validateInteger';
import {
	ALLOWED_NUMBER_OF_TURNS,
} from '../../modules/parameters';
import './EditWeavingCellForm.scss';

// much jiggery-pokery enables a form that updates immediately on change, with no submit button, but validates

const EditWeavingCellForm = (props) => {
	const { canEdit, numberOfTurns } = props;

	const validate = (values) => {
		const errors = {};

		const numberOfTurnsError = validateInteger({
			'max': ALLOWED_NUMBER_OF_TURNS,
			'min': 0,
			'value': values.numberOfTurns,
		});

		if (numberOfTurnsError) {
			errors.numberOfTurns = numberOfTurnsError;
		}

		return errors;
	};

	const formik = useFormik({
		'enableReinitialize': true,
		'initialValues': {
			'numberOfTurns': numberOfTurns,
		},
		validate,
		'onSubmit': () => {},
	});

	const { setFieldValue } = formik;
	global.editWeavingCellErrors = formik.errors; // formik.errors is not updated in the timeout but the global var is

	const handleChangeNumberOfTurns = (e) => {
		const { value } = e.target;

		setFieldValue('numberOfTurns', value);

		clearTimeout(global.editWeavingCellTimeout);

		global.editWeavingCellTimeout = setTimeout(() => {
			if (Object.keys(global.editWeavingCellErrors).length === 0) {
				props.handleSubmit(value);
			}
		}, 800);
	};

	// change initial values after selecting a different cell
	if (numberOfTurns !== formik.initialValues.numberOfTurns) {
		formik.resetForm({
			'values': {
				numberOfTurns,
			},
		});
	}

	return (
		<div className="edit-pattern-form">
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					<label htmlFor="numberOfTurns">
						Number of turns:
						<input
							className={`form-control ${formik.touched.numberOfTurns && formik.errors.numberOfTurns ? 'is-invalid' : ''
							}`}
							disabled={!canEdit}
							placeholder="Pattern name"
							id="numberOfTurns"
							max={ALLOWED_NUMBER_OF_TURNS}
							min="0"
							name="numberOfTurns"
							type="number"
							onChange={handleChangeNumberOfTurns}
							onBlur={formik.handleBlur}
							value={formik.values.numberOfTurns}
						/>
						{formik.touched.numberOfTurns && formik.errors.numberOfTurns ? (
							<div className="invalid-feedback invalid">{formik.errors.numberOfTurns}</div>
						) : null}
					</label>
					<div className="controls">
						<Button
							className="hidden"
							type="submit"
							color="primary"
							disabled={!canEdit}
						>
							Update number of turns
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

EditWeavingCellForm.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
};

export default EditWeavingCellForm;
