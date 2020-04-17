import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Button,
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
import './FAQPage.scss';

const ReactMarkdown = require('react-markdown');

const bodyClass = 'faq';

// FAQs are created directly in the database using for example Robo 3T
// they are not created by Meteor
// so the _id is an object, not a simple string
const getIdAsString = (ObjectId) => ObjectId._str;

class FAQPage extends Component {
	constructor(props) {
		super(props);

		let {
			'location': { hash },
		} = props;


		if (hash.charAt(0) === '#') {
			hash = hash.substring(1);
		}

		this.state = {
			'selectedFAQ': hash,
		};
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	handleClick(e, _id) {
		const {
			history,
			'location': { pathname },
		} = this.props;
		const { selectedFAQ } = this.state;

		let newSelectedFAQ = null; // close the current FAQ

		if (selectedFAQ !== _id) {
			newSelectedFAQ = _id;
		}

		this.setState({
			'selectedFAQ': newSelectedFAQ,
		});

		const url = `${pathname}${newSelectedFAQ ? `#${newSelectedFAQ}` : ''}`;
		history.push(url);
	}

	renderFAQs() {
		const { FAQlist } = this.props;
		const { selectedFAQ } = this.state;

		return (
			<Container>
				<Row>
					<Col>
						<dl className="faq-list">
							{FAQlist.map((faq) => {
								const { _id, answer, question } = faq;
								const _idAsString = getIdAsString(_id);

								return (
									<React.Fragment key={_idAsString}>
										<dt
											selected={_idAsString === selectedFAQ ? 'selected' : ''}
										>
											<Button
												color="link"
												name={_idAsString}
												onClick={(e) => this.handleClick(e, _idAsString)}
											>
												{question}
											</Button>
										</dt>
										{selectedFAQ === _idAsString
										&& (
											<dd
												selected={_idAsString === selectedFAQ ? 'selected' : ''}
											>
												<ReactMarkdown
													source={answer}
													escapeHtml={true}
												/>
											</dd>
										)}
									</React.Fragment>
								);
							})}
						</dl>
					</Col>
				</Row>
			</Container>
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
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'location': PropTypes.objectOf(PropTypes.any),
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

const Tracker = withTracker((props) => {
	const handle = Meteor.subscribe('faq');

	return {
		'FAQlist': FAQ.find(
			{},
			{ 'sort': { 'question': 1 } },
		).fetch(),
		'isLoading': !handle.ready(),
	};
})(FAQPage);

export default connect(mapStateToProps)(Tracker);
