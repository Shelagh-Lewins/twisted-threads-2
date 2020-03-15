import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import validateInteger from '../modules/validateInteger';
import {
	ALLOWED_NUMBER_OF_TURNS,
} from '../../modules/parameters';
import './EditWeavingCellForm.scss';

// timeout enables a form that updates immediately on change, with no submit button, but validates before submitting
// setFieldValue is async: also we want to wait for the user to stop typing

const EditWeavingCellForm = (props) => {
	const {
		canEdit,
		handleSubmit,
		numberOfTurns,
	} = props;

	let fragmentRef = useRef();

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
		'onSubmit': (values) => {
			handleSubmit(values.numberOfTurns);
		},
	});

	const { setFieldValue } = formik;

	const handleChangeNumberOfTurns = (e) => {
		const { value } = e.target;

		setFieldValue('numberOfTurns', value);

		clearTimeout(global.editWeavingCellTimeout);

		global.editWeavingCellTimeout = setTimeout(() => {
			formik.handleSubmit();
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

	if (canEdit) {
		const node = fragmentRef.current;

		if (document.activeElement.id !== 'numberOfTurns') {
			setTimeout(() => { node.focus(); }, 10);
		}
	}

	return (
		<div className="edit-weaving-cell-form edit-pattern-form">
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
							ref={fragmentRef}
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
