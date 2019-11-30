// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';
import { addRecentPattern } from '../modules/auth';
import { getPicksByTablet, modulus } from '../modules/weavingUtils';

import { ColorBooks, Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import WeavingDesign from '../components/WeavingDesign';
import WeftColor from '../components/WeftColor';
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
			'pattern': {
				_id,
				holes,
				numberOfRows,
				numberOfTablets,
				weftColor,
			},
			picksByTablet,
		} = this.props;

		let content = <Loading />;

		const links = (
			<div className="links">
				<Link className="btn btn-primary" to={`/pattern/${_id}/weaving`}>Interactive weaving chart</Link>
			</div>
		);

		let patternWillRepeat = true;
		let patternIsTwistNeutral = true;

		for (let j = 0; j < numberOfTablets; j += 1) {
			const { totalTurns } = picksByTablet[j][numberOfRows - 1];
			const startPosition = modulus(totalTurns, holes) === 0; // tablet is back at start position

			if (totalTurns !== 0) {
				patternIsTwistNeutral = false;
			}

			if (!startPosition) {
				patternWillRepeat = false;
			}

			if (!patternIsTwistNeutral && !patternWillRepeat) {
				break;
			}
		}

		const repeatText = (
			<span className="hint">{patternWillRepeat ? 'The pattern will repeat' : 'The pattern will not repeat'}</span>
		);

		const twistNeutralText = (
			<span className="hint">{patternIsTwistNeutral ? 'The pattern is twist neutral' : 'The pattern is not twist neutral'}</span>
		);

		if (!isLoading) {
			if (pattern.name && pattern.name !== '') {
				content = (
					<>
						<h1>{pattern.name}</h1>
						{links}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						<WeftColor
							dispatch={dispatch}
							weftColor={weftColor}
						/>
						{picksByTablet && picksByTablet.length > 0 && (
							<PatternPreview
								pattern={pattern}
								picksByTablet={picksByTablet}
							/>
						)}
						{repeatText}
						{twistNeutralText}
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
