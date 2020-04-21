import React from 'react';
import { Button } from 'reactstrap';
import { Formik, Form, useField } from 'formik';
import PropTypes from 'prop-types';

import './AddToSetForm.scss';


// for accessibility we need to move focus into the floating panel
/* eslint-disable jsx-a11y/no-autofocus */

// if no new set name is entered, and no changes to the checkboxes for existing sets, then no action will be taken
const validate = (values) => {
	const errors = {};

	return errors;
};

const getIdentifier = (_id) => `checkbox-${_id}`;

// this is taken from the Formik example
// https://jaredpalmer.com/formik/docs/api/useField
// which uses prop spreading for field, props
// useField or Field is required to set and access checkbox 'checked'
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

	const initialValues = {
		'namenewset': '',
	};

	sets.map((set) => {
		const { _id, patterns } = set;
		const identifier = getIdentifier(_id);

		if (patterns.indexOf(patternId) !== -1) {
			initialValues[identifier] = true;
		}
	});

	const setsSorted = sets.sort((a, b) => {
		if (a.name > b.name) {
			return 1;
		} else if (a.name < b.name) {
			return -1;
		}
		return 0;
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
				<>
					<h2>Sets</h2>
					<div className="hint">{`Choose the sets in which the pattern '${patternName}' will appear.`}</div>
					<Form onSubmit={handleSubmit}>
						<div className="form-group">
							<label
								className="input-label"
								htmlFor="namenewset"
							>
								Create a new set:
								<input
									autoFocus="autofocus"
									className={`form-control namenewset ${touched.namenewset && errors.namenewset ? 'is-invalid' : ''
									}`}
									placeholder="Name of new set"
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
						{setsSorted.map((set) => {
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
				</>
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
