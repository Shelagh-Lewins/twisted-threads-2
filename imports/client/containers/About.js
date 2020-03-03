import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import MainMenu from '../components/MainMenu';
import DonatePayPal from '../components/DonatePayPal';
import './About.scss';

const bodyClass = 'about';

class About extends Component {
	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	render() {
		const {
			dispatch,
			errors,
		} = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<div
					className="menu-selected-area"
					ref={this.containerRef}
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
								<h2>Published patterns</h2>
								<p>The <Link to="/">Home</Link> page shows patterns that people have shared. Choose any published pattern to see the threading and weaving charts. Then choose &quot;Interactive weaving chart&quot; to step through the rows one by one as you weave. The Printer-friendly view makes it easier to print a page out for offline reference.</p>
								<h2>Support Twisted Threads</h2>
								<p>I want to keep Twisted Threads free to use, but creating and maintaining it is a lot of work, and the server costs money. If you&apos;d like to support this site, any donations will be very gratefully received!</p>
							</Col>
						</Row>
						<Row>
							<Col className="donate">
								<DonatePayPal />
							</Col>
						</Row>
						<Row>
							<Col>
								<p>Join our <a href="https://www.facebook.com/groups/927805953974190/">Facebook group</a> if you&apos;d like to discuss Twisted Threads with other users, request new features or share feedback with the app developer.</p>
							</Col>
						</Row>
						<Row>
							<Col>
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
