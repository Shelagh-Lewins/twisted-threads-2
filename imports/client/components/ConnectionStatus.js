import React, { Component } from 'react';
import './ConnectionStatus.scss';

class ConnectionStatus extends Component {
	/* meteor.status().status can have these values:
	connected
	connecting (disconnnected, trying to connect)
	failed (permainently failed e.g. incompatible)
	waiting (will try to reconnect)
	offline (user disconnected the connection)
	*/

	// there is a 3 second delay before reporting connection lost, partly to avoid a false 'connection lost' message when the page is first loaded.
	constructor(props) {
		super(props);

		this.state = {
			'showConnectionStatus': false,
			'text': '',
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'checkConnectionStatus',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		// Meteor.status() isn't reactive here, so check manually
		this.checkConnectionStatusInterval = setInterval(() => {
			this.checkConnectionStatus();
		}, 500);
	}

	componentWillUnmount() {
		clearInterval(this.checkConnectionStatusInterval);
	}

	checkConnectionStatus() {
		const connectionStatus = Meteor.status().status;

		switch (connectionStatus) {
			case 'connecting':
			case 'waiting':
				if (global.connectionTimeout === null) {
					const that = this;

					global.connectionTimeout = setTimeout(() => {
						that.setState({
							'showConnectionStatus': true,
							'text': 'Connection to server lost. Trying to reconnect...',
						});

						global.connectionTimeout = null;
					}, 3000);
				}

				break;

			case 'failed':
			case 'offline':
				this.setState({
					'showConnectionStatus': true,
					'text': 'Unable to connect to server',
				});
				break;

			case 'connected':
				if (global.connectionTimeout !== null) {
					clearTimeout(global.connectionTimeout);
					global.connectionTimeout = null;
				}
				this.setState({
					'showConnectionStatus': false,
					'text': '',
				});
				break;

			default:
				break;
		}
	}

	render() {
		const { showConnectionStatus, text } = this.state;

		return (
			<div className={`connection-status ${showConnectionStatus && 'visible'}`}>
				<div className="text">
					{text}
				</div>
			</div>
		);
	}
}

export default ConnectionStatus;
