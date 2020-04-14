import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import { FAQ } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';

const ReactMarkdown = require('react-markdown');

const bodyClass = 'faq';

class FAQPage extends Component {
	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	renderFAQs() {
		const { FAQlist } = this.props;

		return (
			<div>
			some stuff
			</div>
		);
	}

	render() {
		const { errors, isLoading } = this.props;

		return (
			<PageWrapper
				dispatch={() => {}}
				errors={errors}
			>
				<MainMenu />
				<div
					className="menu-selected-area"
				>
					{isLoading && <Loading />}
					<Container>
						<Row>
							<Col>
								<h1>Frequently Asked Questions</h1>
							</Col>
						</Row>
					</Container>
					{!isLoading && this.renderFAQs()}
				</div>
			</PageWrapper>
		);
	}
}

FAQPage.propTypes = {
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'FAQlist': PropTypes.arrayOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

const Tracker = withTracker((props) => {
	const handle = Meteor.subscribe('faq');

	return {
		'FAQlist': FAQ.find().fetch(),
		'isLoading': !handle.ready(),
	};
})(FAQPage);

export default connect(mapStateToProps)(Tracker);
