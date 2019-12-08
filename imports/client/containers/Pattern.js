// detail of a single pattern

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { copyPattern, setIsLoading } from '../modules/pattern';
import { addRecentPattern } from '../modules/auth';
import { findPatternTwist, getNumberOfRepeats, getPicksByTablet } from '../modules/weavingUtils';

import { ColorBooks, Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import WeavingDesign from '../components/WeavingDesign';
import Weft from '../components/Weft';
import PatternPreview from '../components/PatternPreview';
import Threading from '../components/Threading';
import Notation from '../components/Notation';
import PreviewOrientation from '../components/PreviewOrientation';
import './Pattern.scss';

const bodyClass = 'pattern';

class Pattern extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isReady': false, // picksByTablet has to be calculated after pattern data arrives
			// if navigating from another page e.g. Home, it is not possible to set state.pattern.isLoading to true before Tracker runs, because setState is asynchronous
			// so we need something that tells us we are really ready to render
			'gotUser': false, // add to recents after user has loaded
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'copyPattern',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		
		document.body.classList.add(bodyClass);
	}

	componentDidUpdate() {
		const {
			_id,
			dispatch,
			isLoading,
			'pattern': { numberOfTablets },
			picksByTablet,
		} = this.props;

		const { gotUser, isReady } = this.state;

		if (!isLoading && !isReady && picksByTablet && picksByTablet.length === numberOfTablets) {
			this.setState({
				'isReady': true,
			});
		}

		// wait for user details to load
		if (!gotUser && Meteor.user()) {
			dispatch(addRecentPattern({ 'patternId': _id }));
			this.setState({
				'gotUser': true,
			});
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	copyPattern() {
		const { dispatch, _id, history } = this.props;

		dispatch(copyPattern(_id, history));
	}

	render() {
		const {
			colorBookAdded,
			colorBooks,
			dispatch,
			pattern,
			'pattern': {
				_id,
				holes,
				name,
				numberOfRows,
				previewOrientation,
			},
			picksByTablet,
		} = this.props;
		const { isReady } = this.state;

		let content = <Loading />;

		if (isReady) {
			if (name && name !== '') {
				const links = (
					<div className="links">
						<Link className="btn btn-primary" to={`/pattern/${_id}/weaving`}>Interactive weaving chart</Link>
					</div>
				);

				const menu = (
					<div className="menu">
						<Button type="button" color="secondary" onClick={this.copyPattern}>
							Copy pattern
						</Button>
					</div>
				);

				const { patternIsTwistNeutral, patternWillRepeat } = findPatternTwist(holes, picksByTablet);

				let repeatHint = 'The pattern will not repeat.';

				if (patternWillRepeat) {
					if (previewOrientation === 'up') {
						repeatHint = 'The pattern will repeat. To see repeats, set the woven band orientation to left or right.';
					} else {
						repeatHint = `The pattern will repeat (${getNumberOfRepeats(numberOfRows)} repeats shown).`;
					}
				}

				const repeatText = (
					<span className="hint">{repeatHint}</span>
				);

				const twistNeutralText = (
					<span className="hint">{patternIsTwistNeutral ? 'The pattern is twist neutral.' : 'The pattern is not twist neutral.'}</span>
				);

				content = (
					<>
						<h1>{name}</h1>
						{menu}
						{links}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						<h2>Woven band</h2>
						{repeatText}
						{twistNeutralText}
						<Weft
							colorBookAdded={colorBookAdded}
							colorBooks={colorBooks}
							dispatch={dispatch}
							pattern={pattern}
						/>
						<PreviewOrientation
							_id={_id}
							dispatch={dispatch}
							previewOrientation={previewOrientation}
						/>
						{picksByTablet && picksByTablet.length > 0 && (
							<PatternPreview
								dispatch={dispatch}
								pattern={pattern}
								patternWillRepeat={patternWillRepeat}
								picksByTablet={picksByTablet}
							/>
						)}
						{pattern.patternDesign && (
							<WeavingDesign
								dispatch={dispatch}
								pattern={pattern}
								picksByTablet={picksByTablet}
								patternWillRepeat={patternWillRepeat}
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
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
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

const Tracker = withTracker((props) => {
	const { _id, dispatch } = props;
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
