import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	ALLOWED_DIRECTIONS,
	ALLOWED_NUMBER_OF_TURNS,
} from '../../modules/parameters';

const validate = (values) => {
	const errors = {};

	if (!values.numberOfTurns && values.numberOfTurns !== 0) {
		errors.numberOfTurns = 'Required';
	} else if (values.numberOfTurns < 0) {
		errors.numberOfTurns = 'Must be at least 0';
	} else if (values.numberOfTurns > ALLOWED_NUMBER_OF_TURNS) {
		errors.numberOfTurns = `Must not be greater than ${ALLOWED_NUMBER_OF_TURNS}`;
	} else if (!Number.isInteger(values.numberOfTurns)) {
		errors.numberOfTurns = 'Must be a whole number';
	}

	return errors;
};

const EditWeavingCellForm = (props) => {
	const { direction, numberOfTurns } = props;

	const formik = useFormik({
		'initialValues': {
			'direction': direction,
			'numberOfTurns': numberOfTurns,
		},
		validate,
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	// TO DO update form on external cell change

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	const directionOptions = ALLOWED_DIRECTIONS.map((directionOption) => (
		<option
			key={`direction-option-${directionOption.displayName}`}
			label={directionOption.displayName}
			value={directionOption.displayName}
		>
			{directionOption.displayName}
		</option>
	));

	return (
		<div className="edit-weaving-cell-form">
			<h3>Edit weaving cell</h3>
			<form onSubmit={formik.handleSubmit}>
				<Row className="form-group">
					<Col md="6">
						<label htmlFor="numberOfTurns">
							Number of turns
							<input
								className={`form-control ${formik.touched.numberOfTurns && formik.errors.numberOfTurns ? 'is-invalid' : ''
								}`}
								placeholder="Pattern name"
								id="numberOfTurns"
								max={ALLOWED_NUMBER_OF_TURNS}
								min="0"
								name="numberOfTurns"
								type="number"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.numberOfTurns}
							/>
							{formik.touched.numberOfTurns && formik.errors.numberOfTurns ? (
								<div className="invalid-feedback invalid">{formik.errors.numberOfTurns}</div>
							) : null}
						</label>
					</Col>
					<Col md="6">
						<label htmlFor="direction">
							Direction
							<select
								className="form-control"
								id="direction"
								name="direction"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.direction}
							>
								{directionOptions}
							</select>
						</label>
					</Col>
				</Row>
				<div className="controls">
					<Button type="submit" color="primary">Update cell</Button>
				</div>
			</form>
		</div>
	);
};

EditWeavingCellForm.propTypes = {
	'direction': PropTypes.string.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'numberOfTurns': PropTypes.number.isRequired,
};

export default EditWeavingCellForm;
