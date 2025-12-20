// this is the page the user sees if they click a "verify email address" link in an email
// it retrieves a token from the url and attempts to verify the email address

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  emailNotVerified,
  getIsAuthenticated,
  getIsVerified,
  verifyEmail,
} from '../modules/auth';
import { FLASH_MESSAGE_TEXTS } from '../../modules/parameters';
import PageWrapper from '../components/PageWrapper';

class VerifyEmail extends Component {
  constructor() {
    super();

    // bind onClick functions to provide context
    const functionsToBind = ['onCloseFlashMessage'];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });
  }

  componentDidMount() {
    const { dispatch, token } = this.props;

    dispatch(verifyEmail(token));
  }

  onCloseFlashMessage() {
    const { dispatch } = this.props;

    dispatch(emailNotVerified());
  }

  render() {
    const { dispatch, emailVerified, errors, isAuthenticated, isVerified } =
      this.props;

    let message = null;
    let onClick = this.onCloseFlashMessage;
    let type = null;

    if (emailVerified) {
      message = FLASH_MESSAGE_TEXTS.emailVerified;
      onClick = this.onCloseFlashMessage;
      type = 'success';
    }

    return (
      <PageWrapper
        dispatch={dispatch}
        errors={errors}
        message={message}
        onClick={onClick}
        type={type}
      >
        {isAuthenticated && isVerified && (
          <p>
            Your email address is verified. Go ahead and start using{' '}
            <Link to='/'>Twisted Threads</Link>!
          </p>
        )}
      </PageWrapper>
    );
  }
}

VerifyEmail.propTypes = {
  dispatch: PropTypes.func.isRequired,
  emailVerified: PropTypes.bool.isRequired,
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isVerified: PropTypes.bool.isRequired,
  token: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  emailVerified: state.auth.emailVerified,
  errors: state.errors,
  isAuthenticated: getIsAuthenticated(state),
  isVerified: getIsVerified(state),
  token: ownProps.match.params.token, // read the url parameter to find the token
});

export default connect(mapStateToProps)(VerifyEmail);
