// filter a paginated list

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import validateInteger from '../modules/validateInteger';
import {
  updateFilterIsTwistNeutral,
  updateFilterMaxTablets,
  updateFilterMinTablets,
  updateFilterWillRepeat,
  updateFilterRemove,
} from '../modules/pattern';
import { changePage } from '../modules/page';
import { MAX_TABLETS } from '../../modules/parameters';
import './PatternFilterForm.scss';

// timeouts enable a form that updates immediately on change, with no submit button, but validates before submitting
// setFieldValue is async: also we want to wait for the user to stop typing

const PatternFilterForm = (props) => {
  const { dispatch, isTwistNeutral, maxTablets, minTablets, willRepeat } =
    props;
  const history = useHistory();

  const validate = (values) => {
    const errors = {};

    const minTabletsError = validateInteger({
      max: MAX_TABLETS,
      min: 1,
      required: false,
      value: values.minTablets,
    });

    if (minTabletsError) {
      errors.minTablets = minTabletsError;
    }

    const maxTabletsError = validateInteger({
      max: MAX_TABLETS,
      min: 1,
      required: false,
      value: values.maxTablets,
    });

    if (maxTabletsError) {
      errors.maxTablets = maxTabletsError;
    }

    if (values.maxTablets && values.maxTablets <= values.minTablets) {
      errors.maxTablets = 'Must be > minimum tablets';
    }

    return errors;
  };

  const filterActive = maxTablets || minTablets;

  const formik = useFormik({
    initialValues: {
      minTablets: minTablets || '',
      maxTablets: maxTablets || '',
      willRepeat,
      isTwistNeutral,
    },
    validate,
    onSubmit: (values) => {
      dispatch(updateFilterIsTwistNeutral(values.isTwistNeutral));
      dispatch(updateFilterMinTablets(values.minTablets));
      dispatch(updateFilterMaxTablets(values.maxTablets));
      dispatch(updateFilterWillRepeat(values.willRepeat));
      dispatch(changePage(0, history));
    },
  });

  const { setFieldValue } = formik;

  const setFilterTimeout = () => {
    clearTimeout(global.tabletFilterTimeout);

    global.tabletFilterTimeout = setTimeout(() => {
      formik.handleSubmit();
    }, 1000);
  };

  const handleChangeMinTablets = (e) => {
    const { value } = e.target;

    setFieldValue('minTablets', value);
    setFilterTimeout();
  };

  const handleRemoveFilter = () => {
    // it doesn't seem to be possible to set the input values to null or undefined
    // so use empty string for when no value is specified
    setFieldValue('minTablets', '');
    setFieldValue('maxTablets', '');
    dispatch(updateFilterRemove());
    dispatch(changePage(0, history));
  };

  const handleChangeMaxTablets = (e) => {
    const { value } = e.target;

    setFieldValue('maxTablets', value);
    setFilterTimeout();
  };

  const handleChangeWillRepeat = (e) => {
    const { checked } = e.target;

    setFieldValue('willRepeat', checked);
    formik.handleSubmit();
    //setFilterTimeout();
  };

  const handleChangeIsTwistNeutral = (e) => {
    const { checked } = e.target;

    setFieldValue('isTwistNeutral', checked);
    formik.handleSubmit();
    //setFilterTimeout();
  };

  // note firefox doesn't support the 'label' shorthand in option
  // https://bugzilla.mozilla.org/show_bug.cgi?id=40545#c11
  return (
    <div className='pattern-filter-form'>
      <form onSubmit={formik.handleSubmit}>
        <Row className='form-group'>
          <Col lg='12'>
            Show patterns with between
            <label htmlFor='minTablets'>
              Minimum tablets
              <input
                className={`form-control ${
                  formik.touched.minTablets && formik.errors.minTablets
                    ? 'is-invalid'
                    : ''
                }`}
                placeholder='Min'
                id='minTablets'
                max={MAX_TABLETS}
                min='1'
                name='minTablets'
                type='number'
                onChange={handleChangeMinTablets}
                onBlur={formik.handleBlur}
                value={formik.values.minTablets}
              />
              {formik.touched.minTablets && formik.errors.minTablets ? (
                <div className='invalid-feedback invalid'>
                  {formik.errors.minTablets}
                </div>
              ) : null}
            </label>
            and
            <label htmlFor='maxTablets'>
              Maximum tablets
              <input
                className={`form-control ${
                  formik.touched.maxTablets && formik.errors.maxTablets
                    ? 'is-invalid'
                    : ''
                }`}
                placeholder='Max'
                id='maxTablets'
                max={MAX_TABLETS}
                min='1'
                name='maxTablets'
                type='number'
                onChange={handleChangeMaxTablets}
                onBlur={formik.handleBlur}
                value={formik.values.maxTablets}
              />
              {formik.touched.maxTablets && formik.errors.maxTablets ? (
                <div className='invalid-feedback invalid'>
                  {formik.errors.maxTablets}
                </div>
              ) : null}
            </label>
            tablets
            <div className='controls'>
              <Button
                color='secondary'
                disabled={!filterActive}
                onClick={handleRemoveFilter}
                type='cancel'
              >
                Remove filter
              </Button>
              <Button type='submit' color='primary'>
                Update
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg='12'>
            <div className='filter-checkbox'>
              <label className='checkbox-label' htmlFor='isTwistNeutral'>
                <input
                  checked={formik.values.isTwistNeutral}
                  id='isTwistNeutral'
                  name='isTwistNeutral'
                  onBlur={formik.handleBlur}
                  onChange={handleChangeIsTwistNeutral}
                  type='checkbox'
                />
                <div className='checkbox-name'>
                  Only show patterns that are twist neutral
                </div>
              </label>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg='12'>
            <div className='filter-checkbox'>
              <label className='checkbox-label' htmlFor='willRepeat'>
                <input
                  checked={
                    formik.values.isTwistNeutral || formik.values.willRepeat
                  }
                  disabled={formik.values.isTwistNeutral && 'disabled'}
                  id='willRepeat'
                  name='willRepeat'
                  onBlur={formik.handleBlur}
                  onChange={handleChangeWillRepeat}
                  type='checkbox'
                />
                <div className='checkbox-name'>
                  Only show patterns that will repeat
                </div>
              </label>
            </div>
          </Col>
        </Row>
      </form>
    </div>
  );
};

// It seems that the submit button must exist, or validation doesn't happen. As we want filters to update immediately, the buttons is hidden in css.

PatternFilterForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isTwistNeutral: PropTypes.bool,
  maxTablets: PropTypes.number,
  minTablets: PropTypes.number,
  willRepeat: PropTypes.bool,
};

function mapStateToProps(state) {
  const {
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
  } = state.pattern;

  return {
    isTwistNeutral: filterIsTwistNeutral,
    maxTablets: filterMaxTablets,
    minTablets: filterMinTablets,
    willRepeat: filterWillRepeat,
  };
}

export default connect(mapStateToProps)(PatternFilterForm);
