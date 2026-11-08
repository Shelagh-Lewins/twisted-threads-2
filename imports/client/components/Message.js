import React from 'react';
import './Message.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

function Message({ text, type }) {
  return (
    <div className={`message ${type}`}>
      {type === 'warning' && (
        <span className='icon' aria-hidden='true'>
          <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} size='1x' />
        </span>
      )}
      <p>{text}</p>
    </div>
  );
}

Message.propTypes = {
  text: PropTypes.node.isRequired,
  type: PropTypes.string.isRequired,
};

export default Message;
