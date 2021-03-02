// standard wrapper for container component
// provides flash notifications for errors
// or other messages

// for errors, just pass in error object
// for other notifications, pass in message, type e.g. 'success', onClick e.g. dismiss notification condition

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import isEmpty from '../modules/isEmpty';
import formatErrorMessages from '../modules/formatErrorMessages';
import { clearErrors } from '../modules/errors';
import FlashMessage from './FlashMessage';
import ConnectionStatus from './ConnectionStatus';
import MaintenanceMode from './MaintenanceMode';

import {
	getMaintenanceMode,
} from '../modules/auth';

class PageWrapper extends Component {
	constructor() {
		super();

		// bind onClick functions to provide context
		const functionsToBind = [
			'onCloseFlashMessage',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const {
			children,
			errors,
			maintenanceMode,
			message,
			type,
			onClick,
		} = this.props;

		let showFlashMessage = false;
		let messageText;
		let messageType;
		let messageOnClick;

		// errors object has been passed in
		if (!isEmpty(errors)) {
			showFlashMessage = true;
			messageText = formatErrorMessages(errors);
			messageType = 'error';
			messageOnClick = this.onCloseFlashMessage;
		// some custom feedback message
		} else if (typeof message === 'string' && message !== '') {
			showFlashMessage = true;
			messageText = message;
			messageType = type;
			messageOnClick = onClick;
		}

		if (maintenanceMode) {
			return (
				<>
					<ConnectionStatus />
					{showFlashMessage && (
						<Container>
							<Row>
								<Col lg="12">
									<FlashMessage
										message={messageText}
										type={messageType}
										onClick={messageOnClick}
									/>
								</Col>
							</Row>
						</Container>
					)}
					<MaintenanceMode />
				</>
			);
		}
		return (
			<>
				<ConnectionStatus />
				{showFlashMessage && (
					<Container>
						<Row>
							<Col lg="12">
								<FlashMessage
									message={messageText}
									type={messageType}
									onClick={messageOnClick}
								/>
							</Col>
						</Row>
					</Container>
				)}
				{children}
			</>
		);
	}
}

PageWrapper.propTypes = {
	// single or multiple child elements appear differently
	'children': PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
		PropTypes.node,
	]),
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'message': PropTypes.string,
	'onClick': PropTypes.func,
	'type': PropTypes.string,
	'maintenanceMode': PropTypes.bool,
};

const mapStateToProps = (state) => ({
	'maintenanceMode': getMaintenanceMode(state),
});

export default connect(mapStateToProps)(PageWrapper);
