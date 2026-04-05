// add tablets to a border section of a pattern

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { MAX_BORDER_TABLETS } from '../../modules/parameters';
import './AddPatternForm.scss';

const validate = (values, numberOfTablets) => {
  const errors = {};
  if (!values.insertNTablets) {
    errors.insertNTablets = 'Required';
  } else if (values.insertNTablets < 1) {
    errors.insertNTablets = 'Must be at least 1';
  } else if (!Number.isInteger(values.insertNTablets)) {
    errors.insertNTablets = 'Must be a whole number';
  } else if (values.insertNTablets > MAX_BORDER_TABLETS - numberOfTablets) {
    errors.insertNTablets = `Number of border tablets cannot exceed ${MAX_BORDER_TABLETS - numberOfTablets}`;
  }

  if (!values.insertTabletsAt) {
    errors.insertTabletsAt = 'Required';
  } else if (values.insertTabletsAt < 1) {
    errors.insertTabletsAt = 'Must be at least 1';
  } else if (values.insertTabletsAt > numberOfTablets + 1) {
    errors.insertTabletsAt = `Must not be greater than ${numberOfTablets + 1}`;
  } else if (!Number.isInteger(values.insertTabletsAt)) {
    errors.insertTabletsAt = 'Must be a whole number';
  }

  return errors;
};

const AddBorderTabletsForm = (props) => {
  const { numberOfTablets } = props;

  const formik = useFormik({
    initialValues: {
      insertNTablets: 1,
      insertTabletsAt: numberOfTablets + 1,
    },
    validate: (values) => validate(values, numberOfTablets),
    onSubmit: (values, { resetForm }) => {
      props.handleSubmit(values, { resetForm });
    },
  });

  // change initial values after removing a tablet
  if (numberOfTablets + 1 !== formik.initialValues.insertTabletsAt) {
    formik.resetForm({
      values: {
        insertNTablets: 1,
        insertTabletsAt: numberOfTablets + 1,
      },
    });
  }

  return (
    <div className='edit-pattern-form'>
      <form onSubmit={formik.handleSubmit}>
        <Row className='form-group'>
          <Col>
            <label htmlFor='insertNBorderTablets'>
              Add
              <input
                className={`form-control ${
                  formik.touched.insertNTablets && formik.errors.insertNTablets
                    ? 'is-invalid'
                    : ''
                }`}
                placeholder='Number of tablets'
                id='insertNBorderTablets'
                max={MAX_BORDER_TABLETS - numberOfTablets}
                min='1'
                name='insertNTablets'
                type='number'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.insertNTablets}
              />
              {formik.touched.insertNTablets && formik.errors.insertNTablets ? (
                <div className='invalid-feedback invalid'>
                  {formik.errors.insertNTablets}
                </div>
              ) : null}
            </label>
            <label htmlFor='insertBorderTabletsAt'>
              tablets at:
              <input
                className={`form-control ${
                  formik.touched.insertTabletsAt &&
                  formik.errors.insertTabletsAt
                    ? 'is-invalid'
                    : ''
                }`}
                placeholder='Position to insert tablets'
                id='insertBorderTabletsAt'
                max={numberOfTablets + 1}
                min='1'
                name='insertTabletsAt'
                type='number'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.insertTabletsAt}
              />
              {formik.touched.insertTabletsAt &&
              formik.errors.insertTabletsAt ? (
                <div className='invalid-feedback invalid'>
                  {formik.errors.insertTabletsAt}
                </div>
              ) : null}
            </label>
            <div className='controls'>
              <Button type='submit' color='primary'>
                Add tablets
              </Button>
            </div>
          </Col>
        </Row>
      </form>
    </div>
  );
};

AddBorderTabletsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  numberOfTablets: PropTypes.number.isRequired,
};

export default AddBorderTabletsForm;
