// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import {
	getIsLoading,
	getNumberOfRowsForChart,
	getNumberOfTablets,
} from '../modules/pattern';
import { addRecentPattern } from '../modules/auth';
import AppContext from '../modules/appContext';
import { getLocalStorageItem } from '../modules/localStorage';
import Loading from '../components/Loading';
import WeavingChart from '../components/WeavingChart';
import './InteractiveWeavingChart.scss';

const bodyClass = 'interactive-weaving-chart';

class InteractiveWeavingChart extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'gotUser': false, // 0 at top, increasing down
			'selectedRowHasBeenSet': false, // ensure we only load selectedRow from database once
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickDown',
			'handleClickRow',
			'handleClickUp',
			'handleKeyUp',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
		document.addEventListener('keyup', this.handleKeyUp);
	}

	componentDidUpdate() {
		const {
			dispatch,
			numberOfRows,
		} = this.props;
		const { gotUser, selectedRowHasBeenSet } = this.state;
		const { patternId } = this.context;

		// wait for user details to load
		if (!gotUser && (Meteor.user() || Meteor.user() === null)) { // when user is not logged in, Meteor.user() is null after subscription has loaded
			this.setState({
				'gotUser': true,
			});
		}

		// wait for pattern details to be entered in context
		// and set selectedRow if it has not been provided from profile.recentPatterns
		if (numberOfRows > 0 && gotUser && !selectedRowHasBeenSet) {
			let selectedRow = numberOfRows - 1; // row 1 as default

			let recentPatternsList;

			if (Meteor.user()) { // user is logged in
				recentPatternsList = Meteor.user().profile.recentPatterns;
			} else {
				const valueFromLocalStorage = JSON.parse(getLocalStorageItem('recentPatterns'));

				if (valueFromLocalStorage !== null && typeof valueFromLocalStorage === 'object') {
					recentPatternsList = valueFromLocalStorage;
				}
			}

			// currentWeavingRow is stored in recentPatterns as 'natural' row number, 1 +
			// selectedRow starts with 0 at the last row, because that's how the HTML rows are constructed

			if (recentPatternsList) {
				const thisRecentPattern = recentPatternsList.find((recentPattern) => recentPattern.patternId === patternId);
				const { currentWeavingRow } = thisRecentPattern;

				if (thisRecentPattern) {
					if ((typeof currentWeavingRow !== 'undefined')
						&& !isNaN(currentWeavingRow)
						&& currentWeavingRow > 0
						&& currentWeavingRow <= numberOfRows) {
						selectedRow = numberOfRows - currentWeavingRow;
					}
				}

				dispatch(addRecentPattern({
					'currentWeavingRow': this.getCurrentWeavingRow(selectedRow),
					'patternId': patternId,
				}));
			}

			this.setState({
				selectedRow,
				'selectedRowHasBeenSet': true,
			});
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	getCurrentWeavingRow(selectedRow) {
		// get row number 1...n ascending, from index which is 0...going down the page
		const { numberOfRows } = this.props;

		return numberOfRows - selectedRow;
	}

	setSelectedRow(selectedRow) {
		const {
			dispatch,
		} = this.props;
		const { 'pattern': { _id } } = this.context;

		this.setState({
			'selectedRow': selectedRow,
		});

		dispatch(addRecentPattern({
			'currentWeavingRow': this.getCurrentWeavingRow(selectedRow),
			'patternId': _id,
		}));
	}

	handleKeyUp(event) {
		// use up / down arrow to change weaving row
		switch(event.keyCode) {
			case 38: // up arrow
				this.handleKeyUp();
				break;

			case 40: // down arrow
				this.handleKeyDown();
				break;

			default:
				break;
		}
	}

	handleClickDown() {
		const { numberOfRows } = this.props;
		const { selectedRow } = this.state;

		let newRow = selectedRow + 1;
		if (newRow >= numberOfRows) {
			newRow = 0;
		}

		this.setSelectedRow(newRow);
	}

	handleClickUp() {
		const { numberOfRows } = this.props;
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
			numberOfRows,
			numberOfTablets,
			isLoading,
		} = this.props;
		const { selectedRow } = this.state;
		const { pattern } = this.context;

		let content = <Loading />;

		if (!isLoading) {
			if (pattern) {
				const { _id, name, patternType } = pattern;

				const links = (
					<div className="links">
						<Link className="btn btn-primary" to={`/pattern/${_id}`}>Close interactive weaving chart</Link>
					</div>
				);
				if (name && name !== '') {
					content = (
						<>
							<h1>{name}</h1>
							{links}
							{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
							{pattern.patternDesign && (
								<WeavingChart
									dispatch={dispatch}
									handleClickDown={this.handleClickDown}
									handleClickRow={this.handleClickRow}
									handleClickUp={this.handleClickUp}
									numberOfRows={numberOfRows}
									numberOfTablets={numberOfTablets}
									patternType={patternType}
									selectedRow={selectedRow}
								/>
							)}
						</>
					);
				} else {
					content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
				}
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

InteractiveWeavingChart.contextType = AppContext;

InteractiveWeavingChart.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
};

function mapStateToProps(state) {
	return {
		'errors': state.errors,
		'isLoading': getIsLoading(state),
		'numberOfRows': getNumberOfRowsForChart(state),
		'numberOfTablets': getNumberOfTablets(state),
	};
}

export default connect(mapStateToProps)(InteractiveWeavingChart);
