// Add a pattern to a set
// Button opens a panel

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	addPatternToSet,
	addSet,
	removePatternFromSet,
} from '../modules/sets';
import AppContext from '../modules/appContext';
import AddToSetForm from '../forms/AddToSetForm';

import './AddToSet.scss';

import { iconColors } from '../../modules/parameters';

/* eslint-disable no-case-declarations */

class AddToSet extends Component {
	constructor(props) {
		super(props);

		this.state = {
			'showSetsPanel': false,
		};

		// Add to set panel is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'add-to-set-panel-holder';
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
			patternId,
		} = this.props;
		const { checkboxnewset, namenewset } = values;
		const { sets } = this.context;
		let changes = false;
		console.log('submit form', values);
		console.log('sets', sets);

		// analyse changes to set allocation
		Object.keys(values).map((key) => {
			const value = values[key];

			switch (key) {
				// add pattern to a new set
				case 'checkboxnewset':
					console.log('checkboxnewset', value);
					break;

				// name of new set
				case 'namenewset':
					console.log('namenewset', value);
					break;

				// existing sets, this is what we need to analyse
				// check for changes
				default:
					const setId = key.split('-')[1];
					const set = sets.find((setObj) => setObj._id === setId);
					const patternIsInSet = set.patterns.indexOf(patternId) !== -1;

					if (!patternIsInSet && value) {
						// not currently in set: add
						console.log('add to', set.name);
						changes = true;
						dispatch(addPatternToSet({
							patternId,
							setId,
						}));
					} else if (patternIsInSet && !value) {
						// currently in set: remove
						console.log('remove from', set.name);
						changes = true;
						dispatch(removePatternFromSet({
							patternId,
							setId,
						}));
					}
					break;
			}
		});

		this.setState({
			'showSetsPanel': false,
		});

		if (checkboxnewset && namenewset !== '') {
			changes = true;
			dispatch(addSet({ patternId, 'name': namenewset }));
		}

		// force resubscription if sets have changed (publication is not reactive)
		if (changes) {
			global.updateSetsSubscription.set(true);
		}
	}

	render() {
		const { patternId, patternName } = this.props;
		const { showSetsPanel } = this.state;
		const { sets } = this.context;
		const tooltip = 'Add this pattern to a set';

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
							patternId={patternId}
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

// context is used to avoid multiple subscriptions
// and enable NavBar to know about sets
AddToSet.contextType = AppContext;

AddToSet.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(AddToSet);
