import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	ALLOWED_HOLES,
	ALLOWED_PATTERN_TYPES,
	DEFAULT_ROWS,
	DEFAULT_TABLETS,
	DEFAULT_TWILL_DIRECTION,
	MAX_ROWS,
	MAX_TABLETS,
} from '../../modules/parameters';
import './AddPatternForm.scss';

const validate = (values) => {
	const {
		name,
		patternType,
		rows,
		tablets,
	} = values;
	const errors = {};

	if (!name) {
		errors.name = 'Required';
	}

	if (!values.tablets) {
		errors.tablets = 'Required';
	} else if (tablets < 1) {
		errors.tablets = 'Must be at least 1';
	} else if (tablets > MAX_TABLETS) {
		errors.tablets = `Must not be greater than ${MAX_TABLETS}`;
	} else if (!Number.isInteger(tablets)) {
		errors.tablets = 'Must be a whole number';
	}

	const isBrokenTwill = patternType === 'brokenTwill';
	const minRows = isBrokenTwill ? 2 : 1;

	if (!values.rows) {
		errors.rows = 'Required';
	} else if (rows < minRows) {
		errors.rows = `Must be at least ${minRows}`;
	} else if (rows > MAX_ROWS) {
		errors.rows = `Must not be greater than ${MAX_ROWS}`;
	} else if (!Number.isInteger(rows)) {
		errors.rows = 'Must be a whole number';
	} else if (isBrokenTwill && rows % 2 !== 0) {
		errors.rows = 'Must be an even number';
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
			'twillDirection': DEFAULT_TWILL_DIRECTION,
		},
		validate,
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	const { handleCancel } = props;
	const { setFieldValue } = formik;

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

	const twillDirectionControls = (
		<Row className="form-group twill-direction">
			<Col md="12">
				Background twill direction:
				<label htmlFor="twillDirectionS" className="radio-inline control-label">
					<input
						checked={formik.values.twillDirection === 'S'}
						id="twillDirectionS"
						name="twillDirection"
						type="radio"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value="S"
					/>
					S-twill
				</label>
				<label htmlFor="twillDirectionZ" className="radio-inline control-label">
					<input
						checked={formik.values.twillDirection === 'Z'}
						id="twillDirectionZ"
						name="twillDirection"
						type="radio"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value="Z"
					/>
					Z-twill
				</label>
			</Col>
		</Row>
	);

	let typeHint;

	switch (formik.values.patternType) {
		case 'individual':
			typeHint = 'Set the turning direction and number of turns for each tablet individually.';
			break;

		case 'allTogether':
			typeHint = 'Turn all tablets together each pick, either forwards or backwards.';
			break;

		case 'brokenTwill':
			typeHint = 'Weave a double-faced band in two colours, using offset floats to create a diagonal texture.';
			break;

		case 'freehand':
			typeHint = 'Draw the weaving chart freehand; errors will not be corrected. Ideal for brocade and warp pickup patterns.';
			break;

		default:
			break;
	}

	const isBrokenTwill = formik.values.patternType === 'brokenTwill';

	const handleChangePatternType = (e) => {
		formik.handleChange(e);

		if (e.target.value === 'brokenTwill') {
			setFieldValue('holes', 4);
		}
	};

	return (
		<div className="add-pattern-form">
			<h2>Create a new pattern</h2>
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
					<Col md="6">
						<label htmlFor="patternType">
							Pattern type
							<select
								className="form-control"
								id="patternType"
								name="patternType"
								onChange={handleChangePatternType}
								onBlur={formik.handleBlur}
								value={formik.values.patternType}
							>
								{patternTypeOptions}
							</select>
						</label>
						<p className="hint type-hint">{typeHint}</p>
					</Col>
					<Col md="6">
						<div className="form-group">
							<label htmlFor="holes">
								Number of holes in each tablet
								<select
									className="form-control"
									disabled={isBrokenTwill}
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
					<Col md="6">
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
					<Col md="6">
						<label htmlFor="rows">
							Number of rows
							<input
								className={`form-control ${formik.touched.rows && formik.errors.rows ? 'is-invalid' : ''
								}`}
								placeholder="Number of rows"
								id="rows"
								max={MAX_ROWS}
								min={isBrokenTwill ? '2' : '1'}
								name="rows"
								step={isBrokenTwill ? '2' : '1'}
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
				{formik.values.patternType === 'brokenTwill' && twillDirectionControls}
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
