// Add a pattern to a set
// Button opens a panel

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './AddToSet.scss';

import { iconColors } from '../../modules/parameters';

// the edit panel

const SetsPanel = (props) => {
	const {
		handleClickClose,
		patternName,
	} = props;

	return (
		<div className="panel">
			<h2>{`Add pattern "${patternName}" to set`}</h2>
			<Button
				type="button"
				onClick={handleClickClose}
				color="default"
				title="Close"
			>
				Close
			</Button>
		</div>
	);
};

SetsPanel.propTypes = {
	'handleClickClose': PropTypes.func.isRequired,
	'patternName': PropTypes.string.isRequired,
};

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

	handleClickClose = (e) => {
		e.preventDefault();

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
						<SetsPanel
							handleClickClose={this.handleClickClose}
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
	'patternId': PropTypes.string.isRequired,
	'patternName': PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(AddToSet);
