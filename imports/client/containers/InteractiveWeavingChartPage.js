// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import { setIsLoading } from '../modules/pattern';
import { addRecentPattern } from '../modules/auth';
import { getPicksByTablet } from '../modules/weavingUtils';

import { Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import WeavingChart from '../components/WeavingChart';
import './InteractiveWeavingChartPage.scss';

const bodyClass = 'interactive-weaving-chart-page';

class InteractiveWeavingChartPage extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'gotUser': false, // 0 at top, increasing down
			'selectedRowHasBeenSet': false, // ensure we only load selectedRow from database once
		};

		// TODO start at saved value, or row 1

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickDown',
			'handleClickRow',
			'handleClickUp',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentDidUpdate() {
		const { _id, dispatch, pattern } = this.props;
		const { gotUser, selectedRowHasBeenSet } = this.state;

		// wait for user details to load
		if (!gotUser && Meteor.user()) {
			this.setState({
				'gotUser': true,
			});
		}

		// wait for pattern details
		// and set selectedRow if it has not been provided from profile.recentPatterns
		if (pattern && gotUser && !selectedRowHasBeenSet) {
			const { 'pattern': { numberOfRows } } = this.props;
			const { 'profile': { recentPatterns } } = Meteor.user();

			// currentWeavingRow is stored in recentPatterns as 'natural' row number, 1 +
			// selectedRow starts with 0 at the last row, because that's how the HTML rows are constructed

			let selectedRow = numberOfRows - 1; // row 1 as default

			if (recentPatterns) {
				const thisRecentPattern = recentPatterns.find((recentPattern) => recentPattern.patternId === _id);

				if (thisRecentPattern) {
					if ((typeof thisRecentPattern.currentWeavingRow !== 'undefined')
						&& !isNaN(thisRecentPattern.currentWeavingRow)) {
						selectedRow = numberOfRows - thisRecentPattern.currentWeavingRow;
					}
				}
			}

			this.setState({
				selectedRow,
				'selectedRowHasBeenSet': true,
			});

			dispatch(addRecentPattern({
				'currentWeavingRow': this.getCurrentWeavingRow(selectedRow),
				'patternId': _id,
			}));
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	getCurrentWeavingRow(selectedRow) {
		// get row number 1...n ascending, from index which is 0...going down the page
		const {
			'pattern': { numberOfRows },
		} = this.props;

		return numberOfRows - selectedRow;
	}

	setSelectedRow(selectedRow) {
		const {
			_id,
			dispatch,
		} = this.props;

		this.setState({
			'selectedRow': selectedRow,
		});

		dispatch(addRecentPattern({
			'currentWeavingRow': this.getCurrentWeavingRow(selectedRow),
			'patternId': _id,
		}));
	}

	handleClickDown() {
		const {
			'pattern': { numberOfRows },
		} = this.props;
		const { selectedRow } = this.state;

		let newRow = selectedRow + 1;
		if (newRow >= numberOfRows) {
			newRow = 0;
		}

		this.setSelectedRow(newRow);
	}

	handleClickUp() {
		const { 'pattern': { numberOfRows } } = this.props;
		const { selectedRow } = this.state;

		let newRow = selectedRow - 1;
		if (newRow < 0) {
			newRow = numberOfRows - 1;
		}

		this.setSelectedRow(newRow);
	}

	handleClickRow(selectedRow) {
		this.setSelectedRow(selectedRow);
	}

	render() {
		const {
			dispatch,
			errors,
			isLoading,
			pattern,
			'pattern': { _id },
			picksByTablet,
		} = this.props;
		const { selectedRow } = this.state;

		let content = <Loading />;

		const links = (
			<div className="links">
				<Link className="btn btn-primary" to={`/pattern/${_id}`}>Close interactive weaving chart</Link>
			</div>
		);

		if (!isLoading) {
			if (pattern.name && pattern.name !== '') {
				content = (
					<>
						<h1>{pattern.name}</h1>
						{links}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						{pattern.patternDesign && (
							<WeavingChart
								dispatch={dispatch}
								handleClickDown={this.handleClickDown}
								handleClickRow={this.handleClickRow}
								handleClickUp={this.handleClickUp}
								pattern={pattern}
								picksByTablet={picksByTablet}
								selectedRow={selectedRow}
							/>
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

InteractiveWeavingChartPage.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'isLoading': state.pattern.isLoading,
	};
}

const Tracker = withTracker(({ _id, dispatch }) => {
	dispatch(setIsLoading(true));

	Meteor.subscribe('pattern', _id, {
		'onReady': () => dispatch(setIsLoading(false)),
	});

	const pattern = Patterns.findOne({ _id }) || {};

	// pass database data as props
	return {
		'pattern': pattern,
		'picksByTablet': getPicksByTablet(pattern),
	};
})(InteractiveWeavingChartPage);

export default connect(mapStateToProps)(Tracker);
