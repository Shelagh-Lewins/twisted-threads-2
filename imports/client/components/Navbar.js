// Navbar.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			'showDropdown': false,
		};

		this.onLogout = this.onLogout.bind(this);
	}

	onLogout(e) {
		e.preventDefault();

		const { dispatch, history } = this.props;

		// dispatch(authReducer.logoutUser(history));
	}

	showDropdown(e) {
		e.preventDefault();
		this.setState(prevState => ({
			'showDropdown': !prevState.showDropdown,
		}));
	}

	render() {
		const {
			// auth,
			dispatch,
			history,
			location,
		} = this.props;
		// const { isAuthenticated, user } = auth;
		const { isAuthenticated, user } = {
			'isAuthenticated': true,
			'user': { 'username': 'tester' },
		};
		const { showDropdown } = this.state;

		const authLinks = (
			<ul className="navbar-nav ml-auto">
				{user.username
					&& (
						<React.Fragment>
							<li className="nav-item"><Link to="/account" className="nav-link">{user.username}</Link></li>
						</React.Fragment>
					)}
				<li className="nav-item"><Link to="/" className="nav-link" onClick={this.onLogout}>Logout</Link></li>
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
				<Link className="navbar-brand" to="/">Demo App</Link>
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
	// 'auth': PropTypes.objectOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'location': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	// 'auth': state.auth,
	'location': ownProps.location,
});

export default withRouter(connect(mapStateToProps)(Navbar));
