import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Formik, Form, useField } from 'formik';
import PropTypes from 'prop-types';

import './AddToSetForm.scss';


// for accessibility we need to move focus into the floating panel
/* eslint-disable jsx-a11y/no-autofocus */

const validate = (values) => {
	const errors = {};
	const { checkboxnewset } = values;

	if (checkboxnewset && !values.namenewset) {
		errors.namenewset = 'Required';
	}

	return errors;
};

const getIdentifier = (_id) => `checkbox-${_id}`;

// these are taken from the Formik example
// https://jaredpalmer.com/formik/docs/api/useField
// which uses prop spreading for field, props
// useField or Field is required to set and access checkbox 'checked'
const NewSetCheckbox = ({ label, ...props }) => {
	const [field, meta, helpers] = useField(props);
	const { id } = props;

	return (
		<>
			<label
				className="checkbox-label"
				htmlFor={id}
			>
				{label}
				<input {...field} {...props} />
			</label>
			{meta.touched && meta.error ? (
				<div className="error">{meta.error}</div>
			) : null}
		</>
	);
};

NewSetCheckbox.propTypes = {
	'id': PropTypes.string.isRequired,
	'label': PropTypes.string.isRequired,
};

const ExistingSetCheckbox = ({ label, ...props }) => {
	const [field, meta, helpers] = useField(props);
	const { id } = props;

	return (
		<div
			className="existing-set"
		>
			<label
				className="checkbox-label"
				htmlFor={id}
			>
				<input {...field} {...props} />
				<div className="checkbox-name">
					{label}
				</div>
			</label>
		</div>
	);
};

ExistingSetCheckbox.propTypes = {
	'id': PropTypes.string.isRequired,
	'label': PropTypes.string.isRequired,
};

const BasicForm = (props) => {
	const {
		handleCancel,
		handleAddToSet,
		patternId,
		patternName,
		sets,
	} = props;

	// console.log('*** form sets', sets);

	const initialValues = {
		'checkboxnewset': false,
		'namenewset': '',
	};

	// if no existing sets, check new set by default
	if (sets.length === 0) {
		initialValues.newsetcheckbox = true;
	}

	sets.map((set) => {
		const { _id, patterns } = set;
		const identifier = getIdentifier(_id);

		if (patterns.indexOf(patternId) !== -1) {
			initialValues[identifier] = true;
		}
	});

	return (
		<Formik
			initialValues={initialValues}
			onSubmit={(values) => {
				handleAddToSet(values);
			}}
			validate={validate}
			validateOnBlur={false}
		>
			{({
				handleBlur,
				handleChange,
				handleSubmit,
				errors,
				touched,
			}) => (
				<Form onSubmit={handleSubmit}>
					<h2>{`Add pattern "${patternName}" to set`}</h2>
					<div className="hint">Manage which sets this pattern appears in</div>
					<div className="form-group">
						<NewSetCheckbox
							id="checkboxnewset"
							name="checkboxnewset"
							type="checkbox"
							label="New set"
						/>
						<label
							className="input-label"
							htmlFor="namenewset"
						>
							New set
							<input
								autoFocus="autofocus"
								className={`form-control namenewset ${touched.namenewset && errors.namenewset ? 'is-invalid' : ''
								}`}
								placeholder="Name of set"
								id="namenewset"
								name="namenewset"
								type="text"
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							{touched.namenewset && errors.namenewset ? (
								<div className="invalid-feedback invalid">{errors.namenewset}</div>
							) : null}
						</label>
					</div>
					{sets.map((set) => {
						const { _id, name } = set;
						const identifier = getIdentifier(_id);

						return (
							<ExistingSetCheckbox
								key={identifier}
								id={identifier}
								name={identifier}
								type="checkbox"
								label={name}
							/>
						);
					})}
					<div className="controls">
						<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
						<Button type="submit" color="primary">Save</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};

BasicForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleAddToSet': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
	'sets': PropTypes.arrayOf(PropTypes.any).isRequired,
};

const AddToSetForm = (props) => {
	const handleAddToSet = (values) => {
		const { handleSubmit } = props;

		handleSubmit(values);
	};

	const {
		handleCancel,
		patternId,
		patternName,
		sets,
	} = props;

	// handleSubmit is a property of Formik
	// so use a different name for the action function passed in here

	// stopPropagation is used because events bubble up through the React component tree not the DOM tree
	// we don't want to trigger click on pattern summary
	// https://github.com/facebook/react/issues/11387
	// known major issue with portals that the React team seems to be ignoring

	return (
		<div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
			onClick={(e) => e.stopPropagation()}
			className="add-to-set-form"
		>
			<BasicForm
				handleCancel={handleCancel}
				handleAddToSet={handleAddToSet}
				patternId={patternId}
				patternName={patternName}
				sets={sets}
			/>
		</div>
	);
};

AddToSetForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
	'sets': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default AddToSetForm;
