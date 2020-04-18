import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import './AddToSetForm.scss';


// for accessibility we need to move focus into the floating panel
/* eslint-disable jsx-a11y/no-autofocus */

const validate = (values) => {
	const errors = {};
console.log('*** validate', values);
	if (!values.namenewset) {
		errors.namenewset = 'Required';
	}
//TODO only required if checked
	return errors;
};

const getIdentifier = (_id) => `checkbox-${_id}`;

const BasicForm = (props) => {
	const {
		handleCancel,
		handleAddToSet,
		patternId,
		patternName,
		sets,
	} = props;

	console.log('*** form sets', sets);

	const defaultCheckedValues = {
		'checkboxnewset': false,
	};

	// if no existing sets, check new set by default
	if (sets.length === 0) {
		defaultCheckedValues.newsetcheckbox = true;
	}

	sets.map((set) => {
		const { _id, patterns } = set;
		const identifier = getIdentifier(_id);

		if (patterns.indexOf(patternId) !== -1) {
			console.log('found', patternId);
			defaultCheckedValues[identifier] = true;
		}
	});

	console.log('initialValues', defaultCheckedValues);

	return (
		<Formik
			initialValues={{
				'namenewset': '',
			}}
			onSubmit={(values) => {
				console.log('** onSubmit', values);
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
				<form onSubmit={handleSubmit}>
					<h2>{`Add pattern "${patternName}" to set`}</h2>
					<div className="form-group">
						<label
							className="checkbox-label"
							htmlFor="checkboxnewset"
						>
							New set
							<input
								className={`form-control checkboxnewset ${touched.checkboxnewset && errors.checkboxnewset ? 'is-invalid' : ''
								}`}
								id="checkboxnewset"
								name="checkboxnewset"
								type="checkbox"
								onChange={handleChange}
								onBlur={handleBlur}
								defaultChecked={defaultCheckedValues.checkboxnewset}
							/>
							{touched.checkboxnewset && errors.checkboxnewset ? (
								<div className="invalid-feedback invalid">{errors.checkboxnewset}</div>
							) : null}
						</label>
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
							<div
								key={_id}
								className="existing-set"
							>
								<label
									className="checkbox-label"
									htmlFor="identifier"
								>
									<input
										className={`form-control identifier ${touched[identifier] && errors.newsetcheckbox ? 'is-invalid' : ''
										}`}
										id={identifier}
										name={identifier}
										type="checkbox"
										onChange={handleChange}
										onBlur={handleBlur}
										defaultChecked={defaultCheckedValues[identifier]}
									/>
									{touched[identifier] && errors[identifier] ? (
										<div className="invalid-feedback invalid">{errors[identifier]}</div>
									) : null}
									<div className="checkbox-name">
										{name}
									</div>
								</label>
							</div>
						);
					})}
					<div className="controls">
						<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
						<Button type="submit" color="primary">Save</Button>
					</div>
				</form>
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

//TODO can this be a function?
class AddToSetForm extends Component {
	// Color picker is rendered to the body element
	// so it can be positioned within the viewport
	handleAddToSet = (values) => {
		console.log('handleAddToSet in form', values);
		const { handleSubmit } = this.props;

		handleSubmit(values);
	}

	render() {
		const {
			handleCancel,
			patternId,
			patternName,
			sets,
		} = this.props;

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
					handleAddToSet={this.handleAddToSet}
					patternId={patternId}
					patternName={patternName}
					sets={sets}
				/>
			</div>
		);
	}
}

AddToSetForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
	'sets': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default AddToSetForm;
