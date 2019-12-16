// printer-friendly view

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import { setIsLoading } from '../modules/pattern';
import { findPatternTwist, getPicksByTablet } from '../modules/weavingUtils';

import { Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import PatternPreview from '../components/PatternPreview';
import WeavingChartPrint from '../components/WeavingChartPrint';
import ThreadingPrint from '../components/ThreadingPrint';
import Notation from '../components/Notation';
import './PrintView.scss';

const bodyClass = 'print-view';

class PrintView extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'showPrintHint': true,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'onClickClose',
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

	onClickClose() {
		this.setState({
			'showPrintHint': false,
		});
	}

	render() {
		const {
			dispatch,
			errors,
			isLoading,
			pattern,
			'pattern': {
				_id,
				description,
				holes,
				name,
				patternType,
				threadingNotes,
				weavingNotes,
			},
			picksByTablet,
			createdByUser,
		} = this.props;
		const { showPrintHint } = this.state;

		let content = <Loading />;

		const info = (
			<div className="links">
				<p>{`Printed from: ${Meteor.absoluteUrl()}pattern/${_id}`}</p>
				<p>{`Created by: ${createdByUser.username}`}</p>
				<p>{`Pattern type: ${patternType}`}</p>
				{description && description !== '' && (
					<>
						<div>{description}</div>
						<br />
					</>
				)}
			</div>
		);

		if (!isLoading) {
			if (name && name !== '') {
				const { patternWillRepeat } = findPatternTwist(holes, picksByTablet);

				const printHint = (
					<div className="print-hint">
						<div className="innertube">
							<Button
								type="button"
								className="close"
								onClick={this.onClickClose}
							>
							X
							</Button>
							<h2>Check your print settings</h2>
							<p>Look at the print preview before printing. If you do not see a background colour on any square, your browser is probably not set up to print background colours.</p>
							<p>If you&apos;re not sure how to change the print settings, try searching the web for instructions, for example &quot;Firefox print background color&quot; or &quot;Chrome print background color&quot;.</p>
							<p>Important! After printing your pattern, you may want to change the settings back so you won&apos;t waste ink when printing standard web pages.</p>
						</div>
					</div>
				);

				content = (
					<>
						{showPrintHint && printHint}
						<h1>{pattern.name}</h1>
						{info}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						{pattern.patternDesign && (
							<>
								{picksByTablet && picksByTablet.length > 0 && (
									<>
										<h2>Woven band</h2>
										<PatternPreview
											dispatch={dispatch}
											pattern={pattern}
											patternWillRepeat={patternWillRepeat}
											picksByTablet={picksByTablet}
										/>
									</>
								)}
								<h2>Weaving chart</h2>
								<WeavingChartPrint
									pattern={pattern}
									picksByTablet={picksByTablet}
								/>
								{weavingNotes && weavingNotes !== '' && (
									<>
										<h2>Weaving notes</h2>
										<div>{weavingNotes}</div>
										<br />
									</>
								)}
								<h2>Threading chart</h2>
								<ThreadingPrint
									pattern={pattern}
								/>
								{threadingNotes && threadingNotes !== '' && (
									<>
										<h2>Threading notes</h2>
										<div>{threadingNotes}</div>
										<br />
									</>
								)}
								<Notation />
							</>
						)}
					</>
				);
			} else {
				content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
			}
		}

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				{content}
			</PageWrapper>
		);
	}
}

PrintView.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'createdByUser': PropTypes.objectOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'errors': state.errors,
		'isLoading': state.pattern.isLoading,
	};
}

const Tracker = withTracker(({ _id, dispatch }) => {
	let pattern = {};
	dispatch(setIsLoading(true));

	Meteor.subscribe('pattern', _id, {
		'onReady': () => {
			dispatch(setIsLoading(false));
			pattern = Patterns.findOne({ _id });
			const { createdBy } = pattern;
			Meteor.subscribe('users', [createdBy]);
		},
	});

	// pass database data as props
	return {
		'createdByUser': Meteor.users.findOne({ '_id': pattern.createdBy }) || {},
		'pattern': pattern,
		'picksByTablet': getPicksByTablet(pattern),
	};
})(PrintView);

export default connect(mapStateToProps)(Tracker);
