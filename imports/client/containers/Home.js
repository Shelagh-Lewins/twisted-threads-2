import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { addPattern, getPatternCount, setIsLoading } from '../modules/pattern';

import Patterns from '../../collection';
import Loading from '../components/Loading';
import PatternList from '../components/PatternList';
import AddPatternForm from '../components/AddPatternForm';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';

import { ITEMS_PER_PAGE } from '../../parameters';
import './Home.scss';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	handleSubmit = ({ name }, { resetForm }) => {
		const { dispatch } = this.props;

		dispatch(addPattern(name));
		resetForm();
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { errors, isLoading, patterns } = this.props;
		return (
			<div>
				<Container>
					{!isEmpty(errors) && (
						<Row>
							<Col lg="12">
								<FlashMessage
									message={formatErrorMessages(errors)}
									type="error"
									onClick={this.onCloseFlashMessage}
								/>
							</Col>
						</Row>
					)}
					{isLoading && <Loading />}
					<Row>
						<Col lg="12">
							<h1>Home</h1>
							<AddPatternForm
								handleSubmit={this.handleSubmit}
							/>
							<hr />
						</Col>
					</Row>
					<PatternList
						patterns={patterns}
					/>
				</Container>
			</div>
		);
	}
}

Home.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state) {
	return {
		'errors': state.errors,
		'isLoading': state.pattern.isLoading,
		'pageSkip': state.pattern.currentPageNumber * ITEMS_PER_PAGE,
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	dispatch(setIsLoading(true));

	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			dispatch(getPatternCount());
			dispatch(setIsLoading(false));
		},
	});

	// console.log('home pattern', Patterns.find().fetch());

	return {
		'patterns': Patterns.find({}, { 'limit': ITEMS_PER_PAGE }).fetch().sort((a, b) => a.name.localeCompare(b.name)),
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
