import React, { useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import {
	ALLOWED_PATTERN_TYPES,
	DEFAULT_HOLES,
	DEFAULT_ROWS,
	DEFAULT_TABLETS,
	DEFAULT_TWILL_DIRECTION,
	DOUBLE_FACED_ORIENTATIONS,
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
	const isDoubleFaced = patternType === 'doubleFaced';
	const minRows = (isDoubleFaced || isBrokenTwill) ? 2 : 1;

	if (!values.rows) {
		errors.rows = 'Required';
	} else if (rows < minRows) {
		errors.rows = `Must be at least ${minRows}`;
	} else if (rows > MAX_ROWS) {
		errors.rows = `Must not be greater than ${MAX_ROWS}`;
	} else if (!Number.isInteger(rows)) {
		errors.rows = 'Must be a whole number';
	} else if ((isDoubleFaced || isBrokenTwill) && rows % 2 !== 0) {
		errors.rows = 'Must be an even number';
	}

	return errors;
};

const AddPatternForm = (props) => {
	const formik = useFormik({
		'initialValues': {
			'doubleFacedOrientations': DOUBLE_FACED_ORIENTATIONS[0].name,
			'holes': DEFAULT_HOLES,
			'name': '',
			'patternType': 'individual',
			'rows': DEFAULT_ROWS,
			'tablets': DEFAULT_TABLETS,
			'templateType': '',
			'twillDirection': DEFAULT_TWILL_DIRECTION,
		},
		validate,
		'onSubmit': (values, { resetForm }) => {
			props.handleSubmit(values, { resetForm });
		},
	});

	const {
		handleCancel,
	} = props;
	const {
		handleBlur,
		handleChange,
		setFieldValue,
		values,
	} = formik;
	const {
		doubleFacedOrientations,
		holes,
		name,
		patternType,
		rows,
		tablets,
		templateType,
		twillDirection,
	} = values;
	const {
		allowedHoles,
		templates,
		typeHint,
	} = ALLOWED_PATTERN_TYPES.find((type) => type.name === patternType);
	const template = templates && templates.find((type) => type.name === templateType);
	const templateHint = template && template.templateHint;

	// memoised callback to allow setDefaultTemplate to be specified as a dependency without recreating it on every render
	const setDefaultTemplate = useCallback(() => {
		if (templates) {
			setFieldValue('templateType', templates[0].name);
		} else {
			setFieldValue('templateType', undefined);
		}
	}, [setFieldValue, templates]);

	useEffect(() => {
		setDefaultTemplate();
	}, [setDefaultTemplate]);

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

	const templateOptions = () => {
		if (templates) {
			return templates.map((templateDef) => (
				<option
					key={`template-option-${templateDef.name}`}
					label={templateDef.displayName}
					value={templateDef.name}
				>
					{templateDef.displayName}
				</option>
			));
		}

		return [];
	};

	const holeOptions = () => {
		const holeValues = (template && template.allowedHoles) ? template.allowedHoles : allowedHoles;

		return holeValues.map((value) => (
			<option
				key={`hole-option-${value}`}
				value={value}
			>
				{value}
			</option>
		));
	};

	const doubleFacedOrientationsOptions = DOUBLE_FACED_ORIENTATIONS.map((type) => (
		<option
			key={`type-option-${type.name}`}
			label={type.displayName}
			value={type.name}
		>
			{type.displayName}
		</option>
	));

	const doubleFacedOrientationControls = (
		<Row className="form-group double-faced-orientation">
			<Col md="6">
				<label htmlFor="doubleFacedOrientations">
					Tablet orientations
					<select
						className="form-control"
						id="doubleFacedOrientations"
						name="doubleFacedOrientations"
						onChange={handleChange}
						onBlur={handleBlur}
						value={doubleFacedOrientations}
					>
						{doubleFacedOrientationsOptions}
					</select>
				</label>
			</Col>
		</Row>
	);

	const twillDirectionControls = (
		<Row className="form-group twill-direction">
			<Col md="12">
				Background twill direction:
				<label htmlFor="twillDirectionS" className="radio-inline control-label">
					<input
						checked={twillDirection === 'S'}
						id="twillDirectionS"
						name="twillDirection"
						type="radio"
						onChange={handleChange}
						onBlur={handleBlur}
						value="S"
					/>
					S-twill
				</label>
				<label htmlFor="twillDirectionZ" className="radio-inline control-label">
					<input
						checked={twillDirection === 'Z'}
						id="twillDirectionZ"
						name="twillDirection"
						type="radio"
						onChange={handleChange}
						onBlur={handleBlur}
						value="Z"
					/>
					Z-twill
				</label>
			</Col>
		</Row>
	);

	const isBrokenTwill = patternType === 'brokenTwill';
	const isDoubleFaced = patternType === 'doubleFaced';

	const handleChangePatternType = (e) => {
		formik.handleChange(e);

		setFieldValue('holes', DEFAULT_HOLES);
	};

	return (
		<div className="add-pattern-form">
			<h2>Create a new pattern</h2>
			<form onSubmit={formik.handleSubmit}>
				<Row className="form-group">
					<Col sm="12">
						<label htmlFor="name">
							Name
							<input
								className={`form-control ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''
								}`}
								placeholder="Pattern name"
								id="name"
								name="name"
								type="text"
								onChange={handleChange}
								onBlur={handleBlur}
								value={name}
							/>
							{formik.touched.name && formik.errors.name ? (
								<div className="invalid-feedback invalid">{formik.errors.name}</div>
							) : null}
						</label>
					</Col>
				</Row>
				<Row className="form-group">
					<Col md="6">
						<label htmlFor="patternType">
							Pattern type
							<select
								className="form-control"
								id="patternType"
								name="patternType"
								onChange={handleChangePatternType}
								onBlur={handleBlur}
								value={patternType}
							>
								{patternTypeOptions}
							</select>
						</label>
					</Col>
					{templates && (
						<Col md="6">
							<label htmlFor="templateType">
								Template
								<select
									className="form-control"
									id="templateType"
									name="templateType"
									onChange={handleChange}
									onBlur={handleBlur}
									value={templateType}
								>
									{templateOptions()}
								</select>
							</label>
						</Col>
					)}
					<Col md="12">
						<p className="hint type-hint">
							<span className="icon"><FontAwesomeIcon icon={['fas', 'info-circle']} size="1x" /></span>
							{typeHint}
						</p>
						{templateHint && (
							<p className="hint type-hint">
								<span className="icon"><FontAwesomeIcon icon={['fas', 'info-circle']} size="1x" /></span>
								{templateHint}
							</p>
						)}
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
								onChange={handleChange}
								onBlur={handleBlur}
								value={tablets}
							/>
							{formik.touched.tablets && formik.errors.tablets ? (
								<div className="invalid-feedback invalid">{formik.errors.tablets}</div>
							) : null}
						</label>
					</Col>
					<Col md="6">
						<div className="form-group">
							<label htmlFor="holes">
								Number of holes in each tablet
								<select
									className="form-control"
									id="holes"
									name="holes"
									onChange={handleChange}
									onBlur={handleBlur}
									value={holes}
								>
									{holeOptions()}
								</select>
							</label>
						</div>
					</Col>
				</Row>
				<Row className="form-group">
					<Col md="6">
						<label htmlFor="rows">
							Number of rows
							<input
								className={`form-control ${formik.touched.rows && formik.errors.rows ? 'is-invalid' : ''
								}`}
								placeholder="Number of rows"
								id="rows"
								max={MAX_ROWS}
								min={(isBrokenTwill || isDoubleFaced) ? '2' : '1'}
								name="rows"
								step={(isBrokenTwill || isDoubleFaced) ? '2' : '1'}
								type="number"
								onChange={handleChange}
								onBlur={handleBlur}
								value={rows}
							/>
							{formik.touched.rows && formik.errors.rows ? (
								<div className="invalid-feedback invalid">{formik.errors.rows}</div>
							) : null}
						</label>
					</Col>
				</Row>
				{isDoubleFaced && doubleFacedOrientationControls}
				{isBrokenTwill && twillDirectionControls}
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
