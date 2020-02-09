// filter a paginated list

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import validateInteger from '../modules/validateInteger';
import {
	updateFilterRemove,
	updateFilterMaxTablets,
	updateFilterMinTablets,
} from '../modules/pattern';
import {
	MAX_TABLETS,
} from '../../modules/parameters';
import './TabletFilterForm.scss';

// much jiggery-pokery enables a form that updates immediately on change, with no submit button, but validates before submitting

const TabletFilterForm = (props) => {
	const {
		dispatch,
		maxTablets,
		minTablets,
	} = props;
	const history = useHistory();

	const validate = (values) => {
		const errors = {};

		const minTabletsError = validateInteger({
			'max': MAX_TABLETS,
			'min': 1,
			'required': false,
			'value': values.minTablets,
		});

		if (minTabletsError) {
			errors.minTablets = minTabletsError;
		}

		const maxTabletsError = validateInteger({
			'max': MAX_TABLETS,
			'min': 1,
			'required': false,
			'value': values.maxTablets,
		});

		if (maxTabletsError) {
			errors.maxTablets = maxTabletsError;
		}

		if (values.maxTablets && (values.maxTablets <= values.minTablets)) {
			errors.maxTablets = 'Must be > minimum tablets';
		}

		return errors;
	};

	const filterActive = maxTablets || minTablets;

	const formik = useFormik({
		'initialValues': {
			'minTablets': minTablets || '',
			'maxTablets': maxTablets || '',
		},
		validate,
		'onSubmit': () => {},
	});

	const { setFieldValue } = formik;
	global.tabletFilterErrors = formik.errors; // formik.errors is not updated in the timeout but the global var is

	const handleChangeMinTablets = (e) => {
		const { value } = e.target;

		setFieldValue('minTablets', value);

		clearTimeout(global.filterTabletsTimeout);

		global.filterTabletsTimeout = setTimeout(() => {
			if (Object.keys(global.tabletFilterErrors).length === 0) {
				dispatch(updateFilterMinTablets(value, history));
			}
		}, 800);
	};

	const handleRemoveFilter = () => {
		// it doesn't seem to be possible to set the input values to null or undefined
		// so use empty string for when no value is specified
		setFieldValue('minTablets', '');
		setFieldValue('maxTablets', '');
		dispatch(updateFilterRemove(history));
	};

	const handleChangeMaxTablets = (e) => {
		const { value } = e.target;

		setFieldValue('maxTablets', value);

		clearTimeout(global.filterTabletsTimeout);

		global.filterTabletsTimeout = setTimeout(() => {
			if (Object.keys(global.tabletFilterErrors).length === 0) {
				dispatch(updateFilterMaxTablets(value, history));
			}
		}, 800);
	};

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
