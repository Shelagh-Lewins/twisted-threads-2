import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setShowTabletGuides, setShowCenterGuide } from '../modules/pattern';
import './ShowVerticalGuides.scss';
import './VerticalGuides.scss';

function ShowVerticalGuides(props) {
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

  const tabletGuidesTitle =
    'Show guide lines after tablets (guide lines can be set up using the checkboxes above the interactive weaving chart)';
  const tabletGuidesLabel = (
    <>
      Show guide lines after tablets <span className='key vertical-guide' />
      <br />
      To set up guide lines, use the checkboxes above the interactive weaving
      chart
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
        <div className='clearing' />
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
        <div className='clearing' />
      </div>
    </div>
  );
}

ShowVerticalGuides.propTypes = {
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

export default connect(mapStateToProps)(ShowVerticalGuides);
