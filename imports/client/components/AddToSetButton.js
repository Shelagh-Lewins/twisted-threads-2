// Add a pattern to a set

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './AddToSetButton.scss';

import { iconColors } from '../../modules/parameters';

const SetsPanel = (props) => {
	const { setsPanelElm } = props;
	console.log('*** setsPanel elm', setsPanelElm);

	return (
		ReactDOM.createPortal(
			<div className="sets-panel">
				<h2>Add pattern to set</h2>
			</div>,
			setsPanelElm,
		)
	);
};

const AddToSetButton = (props) => {
	const { patternId } = props;
	const [showSetsPanel, setShowSetsPanel] = useState(false);

	const tooltip = 'Add this pattern to a set';
	const setsPanelElm = document.createElement('div');
	setsPanelElm.className = 'add-to-set-holder';

	useEffect(() => {
		console.log('Component did mount (it runs only once)');
		// The portal doesn't work unless the element is rendered immediately
		document.body.appendChild(setsPanelElm);
		return () => document.body.removeChild(setsPanelElm); // unmount
	}, []);

	function onClick(e) {
		e.preventDefault();
		setShowSetsPanel(true);
	}
	console.log('*** showSetsPanel', showSetsPanel);

	return (
		<>
			<div className="add-to-set">
				<Button
					type="button"
					onClick={onClick}
					color="default"
					title={tooltip}
				>
					<FontAwesomeIcon icon={['fas', 'plus']} style={{ 'color': iconColors.default }} size="1x" />
				</Button>
			</div>
			<SetsPanel
				setsPanelElm={setsPanelElm}
			/>
		</>
	);
};

function mapStateToProps(state) {
	return {
		//'canPublish': getCanPublish(state),
	};
}

AddToSetButton.propTypes = {
	//'canPublish': PropTypes.bool.isRequired,
	//'disabled': PropTypes.bool,
	//'isPublic': PropTypes.bool.isRequired,
	//'onChangeIsPublic': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(AddToSetButton);
