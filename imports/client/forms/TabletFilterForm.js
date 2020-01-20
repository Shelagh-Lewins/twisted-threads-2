import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
	removeTabletFilter,
	setFilterMaxTablets,
	setFilterMinTablets,
} from '../modules/pattern';
import {
	MAX_TABLETS,
} from '../../modules/parameters';
import './TabletFilterForm.scss';

const validate = (values, formik) => {
	const errors = {};
console.log('validate values', values);

	// can be null, that means no limit
	if (values.minTablets) {
		console.log('minTablets', typeof values.minTablets);
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

	//formik.errors = errors;

	return errors;
};

const TabletFilterForm = (props) => {
	const {
		dispatch,
		maxTablets,
		minTablets,
	} = props;

	const handleRemoveFilter = () => {
		dispatch(removeTabletFilter());
	};

	const handleChangeMinTablets = (e, formik) => {
		const errors = validate({ 'minTablets': e.target.value }, formik);
console.log('errors', errors);
		if (!errors.minTablets) {
			dispatch(setFilterMinTablets(e.target.value));
		}
	};

	const handleChangeMaxTablets = (e) => {
		const errors = validate({ 'maxTablets': e.target.value });
console.log('errors', errors);
		if (!errors.maxTablets) {
			dispatch(setFilterMaxTablets(e.target.value));
		}
	};

	// can happen if user presses return
	// values seem not to be populated
	const handleSubmit = (values) => {};

	const formik = useFormik({
		'initialValues': {
			minTablets,
			maxTablets,
		},
		validate,
		'onSubmit': (values) => {
			handleSubmit(values);
		},
	});
console.log('main fn, formik', formik);

	return (
		<div className="tablet-filter-form">
			<form onSubmit={formik.handleSubmit}>
				<Row className="form-group">
					<Col lg="6">
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
								onChange={(e) => {
									console.log('formik', formik);
									handleChangeMinTablets(e, formik);
								}}
								onBlur={formik.handleBlur}

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
								value={maxTablets}
							/>
							{formik.touched.maxTablets && formik.errors.maxTablets ? (
								<div className="invalid-feedback invalid">{formik.errors.maxTablets}</div>
							) : null}
						</label>
						tablets
						<div className="controls">
							<Button type="cancel" color="secondary" onClick={handleRemoveFilter}>Remove filter</Button>
							<Button type="submit" color="primary">Update</Button>
						</div>
					</Col>
				</Row>

			</form>
		</div>
	);
};

TabletFilterForm.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'maxTablets': PropTypes.number,
	'minTablets': PropTypes.number,
};

function mapStateToProps(state) {
	return {
		'maxTablets': state.pattern.maxTablets,
		'minTablets': state.pattern.minTablets,
	};
}

export default connect(mapStateToProps)(TabletFilterForm);
