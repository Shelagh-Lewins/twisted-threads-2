import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setShowTabletGuides, setShowCenterGuide } from '../modules/pattern';
import './ShowVerticalGuides.scss';
import './VerticalGuides.scss';

function ShowGuides(props) {
  const { showTabletGuides, showCenterGuide } = props;

  const handleChangeTabletGuidesCheckbox = (event) => {
    const { dispatch } = props;
    const value = event.target.checked;

    dispatch(setShowTabletGuides(value));
  };

  const handleChangeCenterGuideCheckbox = (event) => {
    const { dispatch } = props;
    const value = event.target.checked;

    dispatch(setShowCenterGuide(value));
  };

  const tabletGuidesTitle = 'Show guide lines every 4 tablets';
  const tabletGuidesLabel = (
    <>
      Show guide lines every 4 tablets
      <span className='key vertical-guide' />
    </>
  );

  const centerGuideTitle = 'Show guide line in the centre of the band';
  const centerGuideLabel = (
    <>
      Show guide line in the centre of the band
      <span className='key vertical-guide-center' />
    </>
  );

  return (
    <div className='show-vertical-guides'>
      <div className='wrapper'>
        <input
          checked={showCenterGuide}
          type='checkbox'
          id='showCenterGuide'
          name='showCenterGuide'
          onChange={(event) => handleChangeCenterGuideCheckbox(event)}
          title={centerGuideTitle}
        />
        <label htmlFor='showCenterGuide'>{centerGuideLabel}</label>
      </div>
      <div className='wrapper'>
        <input
          checked={showTabletGuides}
          type='checkbox'
          id='showTabletGuides'
          name='showTabletGuides'
          onChange={(event) => handleChangeTabletGuidesCheckbox(event)}
          title={tabletGuidesTitle}
        />
        <label htmlFor='showVerticalGuides'>{tabletGuidesLabel}</label>
      </div>
    </div>
  );
}

ShowGuides.propTypes = {
  dispatch: PropTypes.func.isRequired,
  showTabletGuides: PropTypes.bool.isRequired,
  showCenterGuide: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    showTabletGuides: state.pattern.showTabletGuides,
    showCenterGuide: state.pattern.showCenterGuide,
  };
}

export default connect(mapStateToProps)(ShowGuides);
