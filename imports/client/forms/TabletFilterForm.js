// add rows to an 'individual' type pattern

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from "react-router-dom";
import {
	updateFilterRemove,
	updateFilterMaxTablets,
	updateFilterMinTablets,
} from '../modules/pattern';
import {
	MAX_TABLETS,
} from '../../modules/parameters';
import './TabletFilterForm.scss';

const validate = (values) => {
	const errors = {};

	// can be null, that means no limit
	if (values.minTablets) {
		const minTablets = parseFloat(values.minTablets, 10);
		if (minTablets < 1) {
			errors.minTablets = 'Must be at least 1';
		} else if (minTablets > MAX_TABLETS) {
			errors.minTablets = `Must not be greater than ${MAX_TABLETS}`;
		} else if (!Number.isInteger(minTablets)) {
			errors.minTablets = 'Must be a whole number';
		}
	}

	// can be null, that means no limit
	if (values.maxTablets) {
		const maxTablets = parseFloat(values.maxTablets, 10);
		if (maxTablets < 1) {
			errors.maxTablets = 'Must be at least 1';
		} else if (maxTablets > MAX_TABLETS) {
			errors.maxTablets = `Must not be greater than ${MAX_TABLETS}`;
		} else if (!Number.isInteger(maxTablets)) {
			errors.maxTablets = 'Must be a whole number';
		} else if (maxTablets <= values.minTablets) {
			errors.maxTablets = 'Must be > minimum tablets';
		}
	}

	return errors;
};

const TabletFilterForm = (props) => {
	const {
		dispatch,
		// history,
		maxTablets,
		minTablets,
	} = props;
	const history = useHistory();

	let setFieldValue;
	const filterActive = maxTablets || minTablets;

	const handleChangeMinTablets = (e) => {
		setFieldValue('minTablets', e.target.value);
		const { value } = e.target;

		clearTimeout(global.filterTabletsTimeout);

		global.filterTabletsTimeout = setTimeout(() => {
			dispatch(updateFilterMinTablets(value, history));
		}, 800);
	};

	const handleChangeMaxTablets = (e) => {
		setFieldValue('maxTablets', e.target.value);
		const { value } = e.target;

		clearTimeout(global.filterTabletsTimeout);

		global.filterTabletsTimeout = setTimeout(() => {
			dispatch(updateFilterMaxTablets(value, history));
		}, 800);
	};

	const handleRemoveFilter = () => {
		// it doesn't seem to be possible to set the input values to null or undefined
		// so use empty string for when no value is specified
		setFieldValue('minTablets', '');
		setFieldValue('maxTablets', '');
		dispatch(updateFilterRemove(history));
	};

	const formik = useFormik({
		'initialValues': {
			'minTablets': minTablets || '',
			'maxTablets': maxTablets || '',
		},
		validate,
		'onSubmit': () => {},
	});

	setFieldValue = formik.setFieldValue;

	// note firefox doesn't support the 'label' shorthand in option
	// https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
	return (
		<div className="tablet-filter-form">
			<form onSubmit={formik.handleSubmit}>
				<Row className="form-group">
					<Col lg="12">
						Show patterns with between
						<label htmlFor="minTablets">
							Minimum tablets
							<input
								className={`form-control ${formik.touched.minTablets && formik.errors.minTablets ? 'is-invalid' : ''
								}`}
								placeholder="Min"
								id="minTablets"
								max={MAX_TABLETS}
								min="1"
								name="minTablets"
								type="number"
								onChange={handleChangeMinTablets}
								onBlur={formik.handleBlur}
								value={formik.values.minTablets}
							/>
							{formik.touched.minTablets && formik.errors.minTablets ? (
								<div className="invalid-feedback invalid">{formik.errors.minTablets}</div>
							) : null}
						</label>
						and
						<label htmlFor="maxTablets">
							Maximum tablets
							<input
								className={`form-control ${formik.touched.maxTablets && formik.errors.maxTablets ? 'is-invalid' : ''
								}`}
								placeholder="Max"
								id="maxTablets"
								max={MAX_TABLETS}
								min="1"
								name="maxTablets"
								type="number"
								onChange={handleChangeMaxTablets}
								onBlur={formik.handleBlur}
								value={formik.values.maxTablets}
							/>
							{formik.touched.maxTablets && formik.errors.maxTablets ? (
								<div className="invalid-feedback invalid">{formik.errors.maxTablets}</div>
							) : null}
						</label>
						tablets
						<div className="controls">
							<Button
								color="secondary"
								disabled={!filterActive}
								onClick={handleRemoveFilter}
								type="cancel"
							>
								Remove filter
							</Button>
							<Button type="submit" color="primary">Update</Button>
						</div>
					</Col>
				</Row>
			</form>
		</div>
	);
};

// It seems that the submit button must exist, or validation doesn't happen. As we want filters to update immediately, the buttons is hidden in css.

TabletFilterForm.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	//'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'maxTablets': PropTypes.number,
	'minTablets': PropTypes.number,
};

function mapStateToProps(state) {
	return {
		'maxTablets': state.pattern.filterMaxTablets,
		'minTablets': state.pattern.filterMinTablets,
	};
}

export default connect(mapStateToProps)(TabletFilterForm);
