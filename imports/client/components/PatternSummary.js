import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { editIsPublic, removePattern } from '../modules/pattern';

import './PatternSummary.scss';
import IsPublicIndicator from './IsPublicIndicator';
import AddToSet from './AddToSet';

import { iconColors } from '../../modules/parameters';
import getPatternPreviewAddress from '../modules/getPatternPreviewAddress';

function PatternSummary(props) {
  const {
    dispatch,
    pattern: {
      _id,
      createdBy,
      description,
      name,
      numberOfTablets,
      isPublic,
      isTwistNeutral,
      willRepeat,
    },
    patternPreview,
    tagTexts,
    user,
  } = props;

  const [patternPreviewAddress, setPatternPreviewAddress] = useState(undefined);
  const [cacheDate] = useState(new Date()); // only refetch the patternPreview on remount

  useEffect(() => {
    if (patternPreview) {
      setPatternPreviewAddress(
        getPatternPreviewAddress(patternPreview, cacheDate),
      );
    }
  }, [patternPreview, cacheDate]);

  let username = '';
  if (user) {
    username = user.username;
  }

  const onChangeIsPublic = () => {
    dispatch(editIsPublic({ _id, isPublic: !isPublic }));
  };

  const handleClickButtonRemove = () => {
    const response = confirm(`Do you want to delete the pattern "${name}"?`); // eslint-disable-line no-restricted-globals

    if (response === true) {
      dispatch(removePattern(_id));
    }
  };

  const canEdit = Meteor.userId() === createdBy;
  const canAddToSet = Meteor.userId();

  // import the preview
  let previewStyle = {};

  if (patternPreviewAddress) {
    previewStyle = {
      backgroundImage: `url(${patternPreviewAddress})`,
    };
  }
  const patternPreviewHolder = (
    <div style={previewStyle} className='pattern-preview' />
  );

  const buttonRemove = (
    <Button
      type='button'
      onClick={() => handleClickButtonRemove({ _id, name })}
      title='Delete pattern'
    >
      <FontAwesomeIcon
        icon={['fas', 'trash']}
        style={{ color: iconColors.default }}
        size='1x'
      />
    </Button>
  );

  const tags = tagTexts.map((text, index) => (
    <span
      className='tag'
      key={`tag-${index}`} // eslint-disable-line react/no-array-index-key
    >
      {text}
    </span>
  ));

  let twistInfo;

  if (isTwistNeutral) {
    twistInfo = <div className='twist-info item'>twist neutral</div>;
  } else if (willRepeat) {
    twistInfo = <div className='twist-info item'>will repeat</div>;
  }

  return (
    <div className='pattern-summary' title={`Pattern: ${name}`}>
      <div className='main'>
        <Link to={`/pattern/${_id}`}>
          <h3>{name}</h3>
          {canAddToSet && <AddToSet patternId={_id} patternName={name} />}
          <div className='description'>{description}</div>
          <div className='info'>
            <div
              className='tablets item'
              title={`Number of tablets: ${numberOfTablets}`}
            >
              <span
                className='icon'
                style={{
                  backgroundImage: `url(${Meteor.absoluteUrl(
                    '/images/tablet_white.svg',
                  )}`,
                }}
              />
              {numberOfTablets}
            </div>
            {tags.length > 0 && <div className='tags item'>{tags}</div>}
            {twistInfo}
          </div>
          {patternPreviewHolder}
        </Link>
      </div>
      <div className='footer'>
        <Link
          to={`/user/${createdBy}`}
          className='created-by'
          title={`Created by: ${username}`}
        >
          <span
            className='icon'
            style={{
              backgroundImage: `url(${Meteor.absoluteUrl(
                '/images/created_by.png',
              )}`,
            }}
          />
          {username}
        </Link>
        {canEdit && (
          <div className='controls'>
            <IsPublicIndicator
              canEdit={canEdit}
              isPublic={isPublic}
              onChangeIsPublic={onChangeIsPublic}
              targetId={_id}
            />
            {buttonRemove}
          </div>
        )}
      </div>
    </div>
  );
}

PatternSummary.propTypes = {
  dispatch: PropTypes.func.isRequired,
  pattern: PropTypes.objectOf(PropTypes.any),
  patternPreview: PropTypes.objectOf(PropTypes.any),
  tagTexts: PropTypes.arrayOf(PropTypes.any),
  user: PropTypes.objectOf(PropTypes.any),
};

export default PatternSummary;
