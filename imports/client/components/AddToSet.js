// Add a pattern to a set
// Button opens a panel

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addSet } from '../modules/sets';
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

	handleClickCancel = (e) => {
		//e.preventDefault();

		this.setState({
			'showSetsPanel': false,
		});
	}

	handleAddToSet = (values) => {
		const { dispatch } = this.props;
		console.log('submit form', values);
		this.setState({
			'showSetsPanel': false,
		});
	}

	render() {
		const { patternName } = this.props;
		const { showSetsPanel } = this.state;
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
							patternName={patternName}
							setsPanelElm={this.el}
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

AddToSet.propTypes = {
	//'canPublish': PropTypes.bool.isRequired,
	//'disabled': PropTypes.bool,
	//'isPublic': PropTypes.bool.isRequired,
	//'onChangeIsPublic': PropTypes.func.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(AddToSet);
