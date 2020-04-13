import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import MainMenu from '../components/MainMenu';

const bodyClass = 'faq';

class FAQ extends Component {
	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	render() {
		const { dispatch, errors } = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<div
					className="menu-selected-area"
				>
					<Container>
						<Row>
							<Col>
								<h1>Frequently Asked Questions</h1>
							</Col>
						</Row>
					</Container>
				</div>
			</PageWrapper>
		);
	}
}

FAQ.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

export default connect(mapStateToProps)(FAQ);
