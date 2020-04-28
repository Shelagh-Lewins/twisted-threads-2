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
} from '../modules/set';
import { setPatternForSetsList } from '../modules/page';
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

	componentDidUpdate(prevProps) {
		const { patternForSetsList, patternId } = this.props;

		// don't allow the panel to be open for more than one pattern at a time
		if (prevProps.patternForSetsList === patternId
			&& patternForSetsList !== patternId) {
			this.setState({
				'showSetsPanel': false,
			});
		}
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	handleClickAddToSetButton = (e) => {
		e.preventDefault();

		const {
			dispatch,
			patternId,
		} = this.props;

		this.setState({
			'showSetsPanel': true,
		});

		dispatch(setPatternForSetsList(patternId));
	}

	handleClickCancel = () => {
		const {
			dispatch,
		} = this.props;

		this.setState({
			'showSetsPanel': false,
		});

		dispatch(setPatternForSetsList(''));
	}

	handleAddToSet = (values) => {
		const {
			dispatch,
			patternId,
		} = this.props;
		const { namenewset } = values;
		const { sets } = this.context;
		let changes = false;

		// analyse changes to set allocation
		Object.keys(values).map((key) => {
			const value = values[key];

			switch (key) {
				// add pattern to a new set
				case 'namenewset':
					break;

				// existing sets, this is what we need to analyse
				// check for changes
				default:
					const setId = key.split('-')[1];
					const set = sets.find((setObj) => setObj._id === setId);
					const patternIsInSet = set.patterns.indexOf(patternId) !== -1;

					if (!patternIsInSet && value) {
						// not currently in set: add
						changes = true;
						dispatch(addPatternToSet({
							patternId,
							setId,
						}));
					} else if (patternIsInSet && !value) {
						// currently in set: remove
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

		if (namenewset !== '') {
			changes = true;
			dispatch(addSet({ patternId, 'name': namenewset }));
		}
	}

	render() {
		const {
			patternId,
			patternName,
		} = this.props;
		const { showSetsPanel } = this.state;
		const { sets } = this.context;
		const tooltip = 'Add to set';

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
							sets={sets.filter((set) => set.createdBy === Meteor.userId())}
						/>,
						this.el,
					)
				)}
			</>
		);
	}
}

// we use connect to get dispatch but do not actually map any props
function mapStateToProps(state) {
	return {
		'patternForSetsList': state.page.patternForSetsList,
	};
}

// context is used to avoid multiple subscriptions
// and enable NavBar to know about sets
AddToSet.contextType = AppContext;

AddToSet.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'patternForSetsList': PropTypes.string.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(AddToSet);
