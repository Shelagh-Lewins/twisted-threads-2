// import the Message component
import React from 'react';
import Message from './Message';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function CreatePatternWarning({
  isAuthenticated,
  canCreatePattern,
  isVerified,
}) {
  let text = null;

  if (!isAuthenticated) {
    text = (
      <>
        To get started, please <Link to='/login'>Login</Link>. If you don&apos;t
        already have an account, please <Link to='/register'>Register</Link>.
      </>
    );
  } else if (!canCreatePattern && !isVerified) {
    text = (
      <>
        To create more patterns, please verify your email address. You can
        request a new verification email from your{' '}
        <Link to='/account'>Account</Link> page
      </>
    );
  } else if (!canCreatePattern && isVerified) {
    text = (
      <>
        You have created the maximum number of patterns allowed for your role.
        To create more patterns, please get in touch with the developer of
        Twisted Threads via the{' '}
        <a
          href='https://www.facebook.com/groups/927805953974190/'
          target='_blank'
          rel='noreferrer noopener'
        >
          Twisted Threads Facebook group
        </a>
        .
      </>
    );
  }

  return text && <Message text={text} type='warning' />;
}

CreatePatternWarning.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  canCreatePattern: PropTypes.bool.isRequired,
  isVerified: PropTypes.bool.isRequired,
};

export default CreatePatternWarning;
