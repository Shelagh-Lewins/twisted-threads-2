import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setShowVerticalGuides } from '../modules/pattern';
import './ShowVerticalGuides.scss';
import './VerticalGuides.scss';

function ShowVerticalGuides(props) {
  const { showVerticalGuides } = props;

  const handleChangeCheckbox = (event) => {
    const { dispatch } = props;
    const value = event.target.checked;

    dispatch(setShowVerticalGuides(value));
    setShowVerticalGuides(value);
  };

  const text =
    'Show vertical guidelines every 4 tablets and in the centre of the band';
  const labelInner = (
    <>
      Show guidelines every 4 tablets
      <span className='key vertical-guide' />
      and in the centre of the band
      <span className='key vertical-guide-center' />
    </>
  );

  return (
    <div className='show-vertical-guides'>
      <input
        checked={showVerticalGuides}
        type='checkbox'
        id='showVerticalGuides'
        name='showVerticalGuides'
        onChange={(event) => handleChangeCheckbox(event)}
        title={text}
      />
      <label htmlFor='showVerticalGuides'>{labelInner}</label>
    </div>
  );
}

ShowVerticalGuides.propTypes = {
  dispatch: PropTypes.func.isRequired,
  showVerticalGuides: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    showVerticalGuides: state.pattern.showVerticalGuides,
  };
}

export default connect(mapStateToProps)(ShowVerticalGuides);
