// Navbar.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link, withRouter } from 'react-router-dom';

import { getIsAuthenticated, getUser } from '../modules/auth';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			'showDropdown': false,
		};
	}

	showDropdown(e) {
		e.preventDefault();
		this.setState((prevState) => ({
			'showDropdown': !prevState.showDropdown,
		}));
	}

	render() {
		const {
			isAuthenticated,
			username,
		} = this.props;

		const { showDropdown } = this.state;

		const authLinks = (
			<ul className="navbar-nav ml-auto">
				<li className="nav-item"><Link to="/account" className="nav-link">{username}</Link></li>
			</ul>
		);
		const guestLinks = (
			<ul className="navbar-nav ml-auto">
				<li className="nav-item">
					<Link className="nav-link" to="/register">Register</Link>
				</li>
				<li className="nav-item">
					<Link className="nav-link" to="/login">Login</Link>
				</li>
			</ul>
		);

		return (
			<nav className="navbar navbar-expand-sm navbar-dark bg-dark">
				<Link className="navbar-brand" to="/">Twisted Threads</Link>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={(e) => { this.showDropdown(e); }}>
					<span className="navbar-toggler-icon" />
				</button>
				<div className={`collapse navbar-collapse ${showDropdown ? 'show' : ''}`} id="navbarSupportedContent">
					{isAuthenticated ? authLinks : guestLinks}
				</div>
			</nav>
		);
	}
}

Navbar.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'username': PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
	'location': ownProps.location,
});

// withTracker makes checks of user status reactive
const Tracker = withTracker(() => ({
	'isAuthenticated': getIsAuthenticated(),
	'username': getUser().username,
}))(Navbar);

export default withRouter(connect(mapStateToProps)(Tracker));
