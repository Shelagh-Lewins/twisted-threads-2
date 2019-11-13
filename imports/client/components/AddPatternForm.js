import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import parameters from '../constants/parameters';

const validate = (values) => {
	const errors = {};

	if (!values.name) {
		errors.name = 'Required';
	}

	if (!values.tablets) {
		errors.tablets = 'Required';
		// TODO positive integer
		// within limits (parameterise)
	}

	// TODO rows, holes

	return errors;
};

const AddPatternForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'holes': 4,
			'name': '',
			'patternType': 'individual',
			'rows': 10,
			'tablets': 8,
		},
		validate,
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	return (
		// note that onBlur is not set because we don't want to show an error unless the user clicks submit
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
						value={formik.values.name}
					/>
					{formik.touched.name && formik.errors.name ? (
						<div className="invalid-feedback invalid">{formik.errors.name}</div>
					) : null}
				</label>
			</div>
			<div className="form-group">
				<label htmlFor="patternType">
					Pattern type
					<select
						className="form-control"
						id="patternType"
						name="patternType"
						onChange={formik.handleChange}
						value={formik.values.patternType}
					>
						<option value="individual" label="Individual" />
						<option value="allTogether" label="All together" />
					</select>
				</label>
			</div>
			<Row className="form-group">
				<Col>
					<label htmlFor="tablets">
						Number of tablets
						<input
							className={`form-control ${formik.touched.tablets && formik.errors.tablets ? 'is-invalid' : ''
							}`}
							placeholder="Number of tablets"
							id="tablets"
							max={parameters.maxTablets}
							min="1"
							name="tablets"
							type="number"
							onChange={formik.handleChange}
							value={formik.values.tablets}
						/>
						{formik.touched.tablets && formik.errors.tablets ? (
							<div className="invalid-feedback invalid">{formik.errors.tablets}</div>
						) : null}
					</label>
				</Col>
				<Col>
					<label htmlFor="tablets">
						Number of rows
						<input
							className={`form-control ${formik.touched.rows && formik.errors.rows ? 'is-invalid' : ''
							}`}
							placeholder="Number of rows"
							id="rows"
							max={parameters.maxRows}
							min="1"
							name="rows"
							type="number"
							onChange={formik.handleChange}
							value={formik.values.rows}
						/>
						{formik.touched.rows && formik.errors.rows ? (
							<div className="invalid-feedback invalid">{formik.errors.rows}</div>
						) : null}
					</label>
				</Col>
				<div className="form-group">
					<label htmlFor="holes">
						Number of holes in each tablet
						<select
							className="form-control"
							id="holes"
							name="holes"
							onChange={formik.handleChange}
							value={formik.values.holes}
						>
							<option value="2" label="2" />
							<option value="4" label="4" />
							<option value="6" label="6" />
						</select>
					</label>
				</div>
			</Row>
			<Button type="submit" color="primary">Create a new pattern</Button>
		</form>
	);
};

AddPatternForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default connect()(AddPatternForm);
