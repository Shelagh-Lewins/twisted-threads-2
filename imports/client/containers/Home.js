import React, { Component } from 'react';
import { connect } from 'react-redux';
import PatternList from '../components/PatternList';
import AddPattern from '../components/AddPattern';
import './Home.scss';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<div>
				<h1>Home</h1>
				<AddPattern />
				<PatternList />
			</div>
		);
	}
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(Home);
