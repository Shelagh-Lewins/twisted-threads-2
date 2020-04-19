// Add a pattern to a set
// Button opens a panel

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addSet } from '../modules/sets';
import AppContext from '../modules/appContext';
import AddToSetForm from '../forms/AddToSetForm';

import './AddToSet.scss';

import { iconColors } from '../../modules/parameters';

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
		//const { newset } = values;
		console.log('submit form', values);
		this.setState({
			'showSetsPanel': false,
		});

		global.updateSetsSubscription.set(true);
//TODO add new set if specified
//Update membership of other sets
//Remove unused sets
//if no changes, do nothing
		//dispatch(addSet({ patternId, 'name': newset }));
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
