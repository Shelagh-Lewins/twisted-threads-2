// Add a pattern to a set
// Button opens a panel

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addSet } from '../modules/sets';
import { Sets } from '../../modules/collection';
import AddToSetForm from '../forms/AddToSetForm';

import './AddToSet.scss';

import { iconColors } from '../../modules/parameters';

class AddToSet extends Component {
// const AddToSetButton = (props) => {
	constructor(props) {
		super(props);

		this.state = {
			'showSetsPanel': false,
		};

		// Add to set panel is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'add-to-set-panel-holder';

		Session.set('updateSetsSubscription', false);
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	handleClickAddToSetButton = (e) => {
		e.preventDefault();

		this.setState({
			'showSetsPanel': true,
		});
	}

	handleClickCancel = () => {
		this.setState({
			'showSetsPanel': false,
		});
	}

	handleAddToSet = (values) => {
		const {
			dispatch,
			handle,
			patternId,
		} = this.props;
		const { newset } = values;
		console.log('submit form', newset);
		this.setState({
			'showSetsPanel': false,
		});

		handle.stop();
		global.updateSetsSubscription = true;
		Session.set('updateSetsSubscription', true);

		dispatch(addSet({ patternId, 'name': newset }));
	}

	render() {
		const { patternName, sets } = this.props;
		const { showSetsPanel } = this.state;
		const tooltip = 'Add this pattern to a set';
console.log('*** sets', sets);
		return (
			<>
				<div className="add-to-set-button">
					<Button
						type="button"
						onClick={this.handleClickAddToSetButton}
						color="default"
						title={tooltip}
					>
						<FontAwesomeIcon icon={['fas', 'plus']} style={{ 'color': iconColors.default }} size="1x" />
					</Button>
				</div>
				{showSetsPanel && (
					ReactDOM.createPortal(
						<AddToSetForm
							handleCancel={this.handleClickCancel}
							handleSubmit={this.handleAddToSet}
							patternName={patternName}
							sets={sets}
						/>,
						this.el,
					)
				)}
			</>
		);
	}
}

function mapStateToProps(state) {
	return {
		//'canPublish': getCanPublish(state),
	};
}

const Tracker = withTracker((props) => {
	let handle = Meteor.subscribe('setsForUser', Meteor.userId());
console.log('tracker', Session.get('updateSetsSubscription'));
	if (global.updateSetsSubscription) {
		console.log('*** resubscribe');
		global.updateSetsSubscription = false;
		handle = Meteor.subscribe('setsForUser', Meteor.userId());
	}

	return {
		handle,
		'sets': Sets.find(
			{},
			{ 'sort': { 'namesort': 1 } },
		).fetch(),
	};
})(AddToSet);

AddToSet.propTypes = {
	//'canPublish': PropTypes.bool.isRequired,
	//'disabled': PropTypes.bool,
	//'isPublic': PropTypes.bool.isRequired,
	//'onChangeIsPublic': PropTypes.func.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
	'sets': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default connect(mapStateToProps)(Tracker);
