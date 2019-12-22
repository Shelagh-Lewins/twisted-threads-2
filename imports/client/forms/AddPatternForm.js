import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	ALLOWED_HOLES,
	ALLOWED_PATTERN_TYPES,
	DEFAULT_ROWS,
	DEFAULT_TABLETS,
	MAX_ROWS,
	MAX_TABLETS,
} from '../../modules/parameters';
import './AddPatternForm.scss';

const validate = (values) => {
	const errors = {};

	if (!values.name) {
		errors.name = 'Required';
	}

	if (!values.tablets) {
		errors.tablets = 'Required';
	} else if (values.tablets < 1) {
		errors.tablets = 'Must be at least 1';
	} else if (values.tablets > MAX_TABLETS) {
		errors.tablets = `Must not be greater than ${MAX_TABLETS}`;
	} else if (!Number.isInteger(values.tablets)) {
		errors.tablets = 'Must be a whole number';
	}

	if (!values.rows) {
		errors.rows = 'Required';
	} else if (values.rows < 1) {
		errors.rows = 'Must be at least 1';
	} else if (values.rows > MAX_ROWS) {
		errors.rows = `Must not be greater than ${MAX_ROWS}`;
	} else if (!Number.isInteger(values.rows)) {
		errors.rows = 'Must be a whole number';
	}

	return errors;
};

const AddPatternForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'holes': ALLOWED_HOLES[1],
			'name': '',
			'patternType': 'individual',
			'rows': DEFAULT_ROWS,
			'tablets': DEFAULT_TABLETS,
		},
		validate,
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	const { handleCancel } = props;

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	const patternTypeOptions = ALLOWED_PATTERN_TYPES.map((type) => (
		<option
			key={`type-option-${type.name}`}
			label={type.displayName}
			value={type.name}
		>
			{type.displayName}
		</option>
	));

	const holeOptions = ALLOWED_HOLES.map((value) => (
		<option
			key={`hole-option-${value}`}
			value={value}
		>
			{value}
		</option>
	));

	return (
		<div className="add-pattern-form">
			<h1>Create pattern</h1>
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					<label htmlFor="name">
						Name
						<input
							className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''
							}`}
							placeholder="Pattern name"
							id="name"
							name="name"
							type="text"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.name}
						/>
						{formik.touched.name && formik.errors.name ? (
							<div className="invalid-feedback invalid">{formik.errors.name}</div>
						) : null}
					</label>
				</div>
				<Row className="form-group">
					<Col lg="6">
						<label htmlFor="patternType">
							Pattern type
							<select
								className="form-control"
								id="patternType"
								name="patternType"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.patternType}
							>
								{patternTypeOptions}
							</select>
						</label>
					</Col>
					<Col lg="6">
						<div className="form-group">
							<label htmlFor="holes">
								Number of holes in each tablet
								<select
									className="form-control"
									id="holes"
									name="holes"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.holes}
								>
									{holeOptions}
								</select>
							</label>
						</div>
					</Col>
				</Row>
				<Row className="form-group">
					<Col lg="6">
						<label htmlFor="tablets">
							Number of tablets
							<input
								className={`form-control ${formik.touched.tablets && formik.errors.tablets ? 'is-invalid' : ''
								}`}
								placeholder="Number of tablets"
								id="tablets"
								max={MAX_TABLETS}
								min="1"
								name="tablets"
								type="number"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.tablets}
							/>
							{formik.touched.tablets && formik.errors.tablets ? (
								<div className="invalid-feedback invalid">{formik.errors.tablets}</div>
							) : null}
						</label>
					</Col>
					<Col>
						<label htmlFor="rows">
							Number of rows
							<input
								className={`form-control ${formik.touched.rows && formik.errors.rows ? 'is-invalid' : ''
								}`}
								placeholder="Number of rows"
								id="rows"
								max={MAX_ROWS}
								min="1"
								name="rows"
								type="number"
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.rows}
							/>
							{formik.touched.rows && formik.errors.rows ? (
								<div className="invalid-feedback invalid">{formik.errors.rows}</div>
							) : null}
						</label>
					</Col>
				</Row>
				<div className="controls">
					<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
					<Button type="submit" color="primary">Create a new pattern</Button>
				</div>
			</form>
		</div>
	);
};

AddPatternForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
};

export default AddPatternForm;