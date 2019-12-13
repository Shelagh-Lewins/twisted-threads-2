// printer-friendly view

import React, { PureComponent } from 'react';
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
import './PrintView.scss';

const bodyClass = 'print-view';

class PrintView extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			// 'gotUser': false, // 0 at top, increasing down
			// 'selectedRowHasBeenSet': false, // ensure we only load selectedRow from database once
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			// 'handleClickDown',
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

	render() {
		const {
			dispatch,
			errors,
			isLoading,
			pattern,
			'pattern': {
				_id,
				createdBy,
				holes,
				name,
			},
			picksByTablet,
		} = this.props;

		let content = <Loading />;
		const user = Meteor.users.findOne({ '_id': createdBy }) || {};

		const info = (
			<div className="links">
				<p>{`Printed from ${Meteor.absoluteUrl()}pattern/${_id}`}</p>
				<p>{`Created by ${user.username}`}</p>
			</div>
		);

		if (!isLoading) {
			if (name && name !== '') {
				const { patternWillRepeat } = findPatternTwist(holes, picksByTablet);

				content = (
					<>
						<h1>{pattern.name}</h1>
						{info}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						{pattern.patternDesign && (
							<>
								{picksByTablet && picksByTablet.length > 0 && (
									<PatternPreview
										dispatch={dispatch}
										pattern={pattern}
										patternWillRepeat={patternWillRepeat}
										picksByTablet={picksByTablet}
									/>
								)}
								<h2>Weaving chart</h2>
								<WeavingChartPrint
									pattern={pattern}
									picksByTablet={picksByTablet}
								/>
								<h2>Threading chart</h2>
								<ThreadingPrint
									pattern={pattern}
								/>
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
};

function mapStateToProps(state, ownProps) {
	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'errors': state.errors,
		'isLoading': state.pattern.isLoading,
	};
}

let pattern = {};

const Tracker = withTracker(({ _id, dispatch }) => {
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
		'pattern': pattern,
		'picksByTablet': getPicksByTablet(pattern),
	};
})(PrintView);

export default connect(mapStateToProps)(Tracker);
