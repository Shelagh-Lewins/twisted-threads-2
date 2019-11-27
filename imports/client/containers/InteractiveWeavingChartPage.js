// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';
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
			'selectedRow': 0, // 0 at top, increasing down
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickDown',
			'handleClickUp',
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

	handleClickDown() {
		const { selectedRow } = this.state;

		this.setState({
			'selectedRow': selectedRow + 1,
		});
	}

	handleClickUp() {
		const { selectedRow } = this.state;

		this.setState({
			'selectedRow': selectedRow - 1,
		});
	}

	render() {
		const {
			dispatch,
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
			<div>
				{content}
			</div>
		);
	}
}

InteractiveWeavingChartPage.propTypes = {
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
