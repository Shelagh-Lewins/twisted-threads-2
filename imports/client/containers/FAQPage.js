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
	constructor(props) {
		super(props);

		this.state = {
			'selectedFAQ': null,
		};
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	renderFAQs() {
		const { FAQlist } = this.props;
		const { selectedFAQ } = this.state;

		return (
			<dl className="faq-list">
				{FAQlist.map((faq) => (
					<React.Fragment key={faq._id}>
						<dt
							selected={faq._id === selectedFAQ ? 'selected' : ''}
						>
							{faq.question}
						</dt>
						<dd
							selected={faq._id === selectedFAQ ? 'selected' : ''}
						>
							{faq.answer}
						</dd>
					</React.Fragment>
				))}
			</dl>
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
