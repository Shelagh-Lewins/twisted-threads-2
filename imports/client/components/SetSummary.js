import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { removeSet } from '../modules/set';
import getPatternPreviewAddress from '../modules/getPatternPreviewAddress';
import SetPreview from './SetPreview';
import { NUMBER_OF_THUMBNAILS_IN_SET } from '../../modules/parameters';

import './SetSummary.scss';

import { iconColors } from '../../modules/parameters';

function SetSummary(props) {
  const {
    dispatch,
    set: { _id, createdBy, description, name, tags },
    patterns,
    patternPreviews,
    user,
  } = props;

  let username = '';
  if (user) {
    username = user.username;
  }

  const [patternPreviewAddresses, setPatternPreviewAddresses] = useState([]);
  const [cacheDate] = useState(new Date()); // only refetch the patternPreview on remount

  useEffect(() => {
    const summaryPatternPreviewAddresses = patterns
      .slice(0, NUMBER_OF_THUMBNAILS_IN_SET)
      .map((pattern) => {
        let patternPreviewAddress;

        if (pattern) {
          const patternPreview = patternPreviews.find(
            (preview) => pattern._id === preview.patternId,
          );

          if (patternPreview) {
            patternPreviewAddress = getPatternPreviewAddress(
              patternPreview,
              cacheDate,
            );
          }
        }

        return patternPreviewAddress;
      });

    setPatternPreviewAddresses(summaryPatternPreviewAddresses);
  }, [patternPreviews, patterns, cacheDate]);

  const handleClickButtonRemove = () => {
    const response = confirm(`Do you want to delete the set "${name}"?`); // eslint-disable-line no-restricted-globals

    if (response === true) {
      dispatch(removeSet(_id));
    }
  };

  const canEdit = Meteor.userId() === createdBy;

  const buttonRemove = (
    <Button
      type='button'
      onClick={() => handleClickButtonRemove()}
      title='Delete set'
    >
      <FontAwesomeIcon
        icon={['fas', 'trash']}
        style={{ color: iconColors.default }}
        size='1x'
      />
    </Button>
  );

  // if no description, concatenate pattern names instead
  let text = description;

  if (!description && patterns) {
    text = patterns.reduce(
      (workingString, pattern, index) =>
        workingString +
        (pattern ? pattern.name : '') +
        (index === patterns.length - 1 ? '' : ', '),
      '',
    );
  }

  const tagElms = tags.map((Tagtext, index) => (
    <span
      className='tag'
      key={`tag-${index}`} // eslint-disable-line react/no-array-index-key
    >
      {Tagtext}
    </span>
  ));

  return (
    <div className='set-summary' title={`Set: ${name}`}>
      <div className='main'>
        <Link to={`/set/${_id}`}>
          <h3>{name}</h3>
          <div className='description'>{text}</div>
          <div className='info'>
            <div className='tags'>{tagElms}</div>
            <div
              className='number-of-patterns'
              title={`Number of patterns in set: ${patterns.length}`}
            >
              <span
                className='icon'
                style={{
                  backgroundImage: `url(${Meteor.absoluteUrl(
                    '/images/logo.png',
                  )}`,
                }}
              />
              {patterns.length}
            </div>
          </div>

          <SetPreview
            patternPreviewAddresses={patternPreviewAddresses}
            patterns={patterns}
          />
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
        {canEdit && <div className='controls'>{buttonRemove}</div>}
      </div>
    </div>
  );
}

SetSummary.propTypes = {
  dispatch: PropTypes.func.isRequired,
  patterns: PropTypes.arrayOf(PropTypes.any),
  patternPreviews: PropTypes.arrayOf(PropTypes.any),
  set: PropTypes.objectOf(PropTypes.any),
  user: PropTypes.objectOf(PropTypes.any),
};

export default SetSummary;
