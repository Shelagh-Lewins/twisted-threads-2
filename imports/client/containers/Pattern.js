// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';
import { addRecentPattern } from '../modules/auth';
import { getPicksByTablet } from '../modules/weavingUtils';

import { ColorBooks, Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import WeavingDesign from '../components/WeavingDesign';
import PatternPreview from '../components/PatternPreview';
import Threading from '../components/Threading';
import Notation from '../components/Notation';
import './Pattern.scss';

const bodyClass = 'pattern';

class Pattern extends PureComponent {
	componentDidMount() {
		const { dispatch, _id } = this.props;
		dispatch(addRecentPattern({ 'patternId': _id }));

		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	render() {
		const {
			colorBookAdded,
			colorBooks,
			dispatch,
			isLoading,
			pattern,
			'pattern': { _id },
			picksByTablet,
		} = this.props;

		let content = <Loading />;

		const links = (
			<div className="links">
				<Link className="btn btn-primary" to={`/pattern/${_id}/weaving`}>Interactive weaving chart</Link>
			</div>
		);

		if (!isLoading) {
			if (pattern.name && pattern.name !== '') {
				content = (
					<>
						<h1>{pattern.name}</h1>
						{links}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						{pattern.picksByTablet && (
							<PatternPreview
								picksByTablet={picksByTablet}
							/>
						)}
						{pattern.patternDesign && (
							<WeavingDesign
								dispatch={dispatch}
								pattern={pattern}
								picksByTablet={picksByTablet}
							/>
						)}
						{pattern.threading && (
							<Threading
								colorBookAdded={colorBookAdded}
								colorBooks={colorBooks}
								dispatch={dispatch}
								pattern={pattern}
							/>
						)}
						<Notation />
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

Pattern.propTypes = {
	'_id': PropTypes.string.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'colorBookAdded': state.colorBook.colorBookAdded,
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'isLoading': state.pattern.isLoading,
	};
}

const Tracker = withTracker(({ _id, dispatch }) => {
	dispatch(setIsLoading(true));

	Meteor.subscribe('pattern', _id, {
		'onReady': () => dispatch(setIsLoading(false)),
	});

	Meteor.subscribe('colorBooks');

	const pattern = Patterns.findOne({ _id }) || {};

	// pass database data as props
	return {
		'colorBooks': ColorBooks.find({}, {
			'sort': { 'nameSort': 1 },
		}).fetch(),
		'pattern': pattern,
		'picksByTablet': getPicksByTablet(pattern),
	};
})(Pattern);

export default connect(mapStateToProps)(Tracker);
