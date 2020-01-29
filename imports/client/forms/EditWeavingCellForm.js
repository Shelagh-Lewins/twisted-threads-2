import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	ALLOWED_NUMBER_OF_TURNS,
} from '../../modules/parameters';
import './EditWeavingCellForm.scss';

const validate = (values) => {
	const errors = {};

	const numberOfTurns = parseFloat(values.numberOfTurns);

	if (!values.numberOfTurns && numberOfTurns !== 0) {
		errors.numberOfTurns = 'Required';
	} else if (numberOfTurns < 0) {
		errors.numberOfTurns = 'Must be at least 0';
	} else if (numberOfTurns > ALLOWED_NUMBER_OF_TURNS) {
		errors.numberOfTurns = `Must not be greater than ${ALLOWED_NUMBER_OF_TURNS}`;
	} else if (!Number.isInteger(numberOfTurns)) {
		errors.numberOfTurns = 'Must be a whole number';
	}

	return errors;
};

const EditWeavingCellForm = (props) => {
	const { canEdit, numberOfTurns } = props;
	let setFieldValue;

	const handleChangeNumberOfTurns = (e) => {
		const { value } = e.target;

		setFieldValue('numberOfTurns', value);

		clearTimeout(global.editWeavingCellTimeout);

		global.editWeavingCellTimeout = setTimeout(() => {
			props.handleSubmit(value);
		}, 800);
	};

	const formik = useFormik({
		'enableReinitialize': true,
		'initialValues': {
			'numberOfTurns': numberOfTurns,
		},
		validate,
		'onSubmit': () => {},
	});

	// change initial values after selecting a different cell
	if (numberOfTurns !== formik.initialValues.numberOfTurns) {
		formik.resetForm({
			'values': {
				numberOfTurns,
			},
		});
	}

	setFieldValue = formik.setFieldValue;

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
