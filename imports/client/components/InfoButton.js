import React, { useState } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconColors } from '../../modules/parameters';
import './InfoButton.scss';

// at present the message appears below and to the left
// the component can be extended as needed to position the message differently
function InfoButton(props) {
  const { message, title } = props;
  const [showMessage, setShowMessage] = useState(false);

  const handleClickInfoButton = () => {
    setShowMessage(!showMessage);
  };

  return (
    <div className='info-button'>
      <Button
        className='info-button'
        color='link'
        onClick={handleClickInfoButton}
        title={title || 'Click for more information'}
      >
        <FontAwesomeIcon
          icon={['fas', 'question-circle']}
          style={{ color: iconColors.default }}
          size='1x'
        />
      </Button>
      {showMessage && <div className='message'>{message}</div>}
    </div>
  );
}

InfoButton.propTypes = {
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default InfoButton;
