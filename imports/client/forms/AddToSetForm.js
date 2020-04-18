import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import './AddToSetForm.scss';


// for accessibility we need to move focus into the floating panel
/* eslint-disable jsx-a11y/no-autofocus */

const validate = (values) => {
	const errors = {};

	if (!values.newset) {
		errors.newset = 'Required';
	}

	return errors;
};

const BasicForm = (props) => {
	const {
		handleCancel,
		handleAddToSet,
		patternName,
	} = props;

	return (
		<Formik
			initialValues={{ 'newset': '' }}
			onSubmit={(values) => {
				console.log('** onSubmit');
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
				values,
			}) => (
				<form onSubmit={handleSubmit}>
					<h2>{`Add pattern "${patternName}" to set`}</h2>
					<div className="form-group">
						<label htmlFor="newset">
							New set
							<input
								autoFocus="autofocus"
								className={`form-control newset ${touched.newset && errors.newset ? 'is-invalid' : ''
								}`}
								placeholder="Name of set"
								id="newset"
								name="newset"
								type="text"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.newset}
							/>
							{touched.newset && errors.newset ? (
								<div className="invalid-feedback invalid">{errors.newset}</div>
							) : null}
						</label>
					</div>
					<div className="controls">
						<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
						<Button type="submit" color="primary">Add</Button>
					</div>
				</form>
			)}
		</Formik>
	);
};

BasicForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleAddToSet': PropTypes.func.isRequired,
	'patternName': PropTypes.string.isRequired,
};

class AddToSetForm extends Component {
	// Color picker is rendered to the body element
	// so it can be positioned within the viewport
	constructor(props) {
		super(props);

		this.state = {
			'selectedSet': null,
		};
	}

	/* componentDidUpdate() {
		const { pickerReinitialize } = this.state;

		if (pickerReinitialize) {
			this.setState({
				'pickerReinitialize': false,
			});
		}
	} */

	/* handleColorChange = (colorObject) => {
		this.setState({
			'colorValue': colorObject.hex,
		});
	} */

	handleAddToSet = ({ newset }) => {
		console.log('handleAddToSet in form');
		const { handleSubmit } = this.props;
		//const { colors } = this.state;

		handleSubmit({ newset });
	}

	render() {
		const {
			handleCancel,
			patternName,
		} = this.props;
		const {
			selectedSet,
		} = this.state;

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
					patternName={patternName}
				/>
			</div>
		);
	}
}

AddToSetForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
	'patternName': PropTypes.string.isRequired,
	// sets
};

export default AddToSetForm;
