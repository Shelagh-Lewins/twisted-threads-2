import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import getUserpicStyle from '../modules/getUserpicStyle';
import { iconColors } from '../../modules/parameters';
import './UserSummary.scss';
import './Userpic.scss';

function UserSummary(props) {
  const {
    user: {
      _id,
      description,
      publicColorBooksCount,
      publicPatternsCount,
      username,
    },
  } = props;

  return (
    <div className='user-summary'>
      <div className='main'>
        <Link to={`/user/${_id}`}>
          <h3>
            <span
              className={`icon ${getUserpicStyle(_id)}`}
              style={{
                backgroundImage: `url(${Meteor.absoluteUrl('/images/user_profile.png')}`,
              }}
            />
            {username}
          </h3>
          <div className='info'>
            <div className='description'>{description || ''}</div>
            <div
              className='public-patterns'
              title='Number of published patterns'
            >
              <span
                className='icon'
                style={{
                  backgroundImage: `url(${Meteor.absoluteUrl('/images/number_of_patterns.png')}`,
                }}
              />
              {publicPatternsCount || 0}
            </div>
            <div
              className='public-color-books'
              title='Number of published colour books'
            >
              <span className='icon'>
                <FontAwesomeIcon
                  icon={['fas', 'book-open']}
                  style={{ color: iconColors.default }}
                  size='1x'
                />
              </span>
              {typeof publicColorBooksCount === 'number'
                ? publicColorBooksCount
                : 0}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

UserSummary.propTypes = {
  user: PropTypes.objectOf(PropTypes.any),
};

export default UserSummary;
