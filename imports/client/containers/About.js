import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Col,
	Container,
	Row,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import MainMenu from '../components/MainMenu';
import DonatePayPal from '../components/DonatePayPal';
import DonateKoFi from '../components/DonateKoFi';
import DonatePatreon from '../components/DonatePatreon';
import './About.scss';

const bodyClass = 'about';

class About extends Component {
	constructor(props) {
		super(props);

		this.state = {
			'showEmailAddress': false, // show the email address
			'showEmailCheckbox': false, // show the checkbox allowing the user to request the email address
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickShowEmailButton',
			'handleChangeShowEmailCheckbox',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	handleClickShowEmailButton() {
		const { showEmailCheckbox } = this.state;

		this.setState({
			'showEmailCheckbox': !showEmailCheckbox,
		});
	}

	handleChangeShowEmailCheckbox(event) {
		const value = event.target.checked;

		this.setState({
			'showEmailAddress': value,
		});
	}

	render() {
		const {
			dispatch,
			errors,
		} = this.props;

		const {
			showEmailAddress,
			showEmailCheckbox,
		} = this.state;

		const contactInfo = (
			<div className="contact-info">
				{!showEmailCheckbox && (
					<Button
						onClick={this.handleClickShowEmailButton}
						type="button"
						color="secondary"
					>
						Show me how to get in touch
					</Button>
				)}
				{showEmailCheckbox && (
					<div className="update-preview-control custom-checkbox custom-control">
						<input
							checked={showEmailAddress}
							type="checkbox"
							id="showEmailAddress"
							className="custom-control-input"
							name="showEmailAddress"
							onChange={this.handleChangeShowEmailCheckbox}
							onBlur={this.handleChangeShowEmailCheckbox}
						/>
						<label className="custom-control-label" htmlFor="showEmailAddress">I am interested in tablet weaving</label>
					</div>
				)}
				{showEmailAddress && <p>Email: <a href="mailto:twistedthreadsapp@gmail.com?subject=Twisted%20Threads" target="_top">twistedthreadsapp@gmail.com</a></p>}
			</div>
		);

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
								<h1>About Twisted Threads</h1>
								<p>Twisted Threads is an open source, free to use web app for creating, weaving and sharing patterns for tablet weaving.</p>
								<p>Tablet weaving is an ancient craft known around the world by different names including card weaving, brettchen weberei, brikvævning and tissage &agrave; carton. There are many excellent website and online videos to help you get started.</p>
								<p>Please don&apos;t share copyrighted patterns without the owner&apos;s permission. Any patterns that violate copyright may be unshared without notice.</p>
							</Col>
						</Row>
						<Row>
							<Col>
								<h2>Support Twisted Threads</h2>
								<p>I want to keep Twisted Threads free to use, but creating and maintaining it is a lot of work, and the server costs money. If you&apos;d like to support this site, any donations will be very gratefully received! You can use Patreon, Ko-fi or PayPal.</p>
							</Col>
						</Row>
						<Row>
							<Col>
								<div className="donations">
									<DonatePatreon />
									<DonateKoFi />
									<DonatePayPal />
								</div>
							</Col>
						</Row>
						<Row>
							<Col>
								<h2>Published patterns</h2>
								<p>The <Link to="/">Home</Link> page shows patterns that people have shared. Choose any published pattern to see the threading and weaving charts. Then choose &quot;Interactive weaving chart&quot; to step through the rows one by one as you weave. The Printer-friendly view makes it easier to print a page out for offline reference.</p>
								<h2>Creating your own patterns</h2>
								<p>To create your own patterns in Twisted Threads, first <Link to="/register">register</Link> a free account. You should then see the New Pattern button on the <Link to="/">Home</Link> page which will allow to you create these types of pattern:</p>
								<ul>
									<li>Individual: design your pattern by clicking the weaving chart to set the turning direction and number of turns for each tablet.</li>
									<li>All together: all tablets are turned together, a single turn, to quickly create simple patterns.</li>
									<li>3/1 broken twill: use the design chart to create complex patterns with a broken twill structure.</li>
									<li>Freehand: draw your pattern on virtual graph paper. This is great for brocade and warp pickup patterns, but be warned that mistakes will not be corrected.</li>
								</ul>
								<p>Any pattern you create is private by default - only you can see it. If you have verified your email address then you&apos;ll be able to make any of your patterns public. Verifying your email address will also increase the number of patterns and colour books you can create.</p>
								<p>Twisted Threads patterns use the pattern notation developed in the book <a href="https://www.salakirjat.com/product/159/applesies-and-fox-noses---finnish-tabletwoven-bands" target="_blank" rel="noreferrer noopener">Applesies and Fox Noses - Finnish Tablewoven Bands</a>.</p>
								<h2>Development</h2>
								<p>My name is Shelagh Lewins and I began developing Twisted Threads in 2016 because I got fed up with trying to keep track of patterns on bits of paper while I weave - and because I wanted an easier way to design patterns.</p>
								<p>In late 2019 I started work on a complete rewrite of the app with improved pattern design tools and better performance. This current app is the all-new Twisted Threads 2: Revenge of the Warped. Enjoy!</p>
								<p>Twisted Threads is build using <a href="https://www.meteor.com/" target="_blank" rel="noreferrer noopener">Meteor</a>, an open-source NodeJS framework. The front end is built using <a href="https://reactjs.org/" target="_blank" rel="noreferrer noopener">React</a> and <a href="https://redux.js.org/" target="_blank" rel="noreferrer noopener">Redux</a>.</p>
							</Col>
						</Row>
						<Row>
							<Col>
								<h2>Contact</h2>
								<p>Join our <a href="https://www.facebook.com/groups/twistedthreadsapp/" target="_blank" rel="noreferrer noopener">Facebook group</a> if you&apos;d like to discuss Twisted Threads with other users, request new features or share feedback with the app developer.</p>
								<p>If you&apos;d like to contact the developer directly, you can send me an email - click the button below to see the address.</p>
								{contactInfo}
							</Col>
						</Row>
						<Row>
							<Col>
								<h2>Credits</h2>
								<p>My humble thanks  to the generous people who support Twisted Threads through donations.</p>
								<p>I owe a special debt to Mark Roth, design consultant and software tester throughout the development of Twisted Threads 2.</p>
								<p className="notice">Twisted Threads may not work correctly in the Safari browser. If you have any problems, please try it in Chrome.</p>
								<p className="notice">The copyright of any pattern designed using Twisted Threads rests with the designer of the pattern, not with the creator or owner of the software.</p>
							</Col>
						</Row>
					</Container>
				</div>
			</PageWrapper>
		);
	}
}

About.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

export default connect(mapStateToProps)(About);
