import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './WeavingInstructionsAllTogetherPrint.scss';

function WeavingInstructionsAllTogetherPrint(props) {
	const {
		numberOfRows,
		'patternDesign': { weavingInstructions },
	} = props;

	const renderRowDirectionButton = (direction, index) => (
		<Button
			disabled={true}
			key={`row-${index}`}
			onClick={() => {}}
			value={index}
		>
			{direction === 'F' ? 'F' : 'B'}
			<span className="row-number">{index + 1}</span>
		</Button>
	);

	const renderWeavingInstructions = () => (
		<div className="weaving-instructions">
			<div className="row-direction-buttons">
				{weavingInstructions.map((direction, index) => renderRowDirectionButton(direction, index))}
			</div>
		</div>
	);

	return (
		<div className="weaving">
			<p>Turn all tablets together, forward or backward, following the sequence shown below</p>
			<p>Number of rows: {numberOfRows}</p>
			<div
				className="content"
			>
				{renderWeavingInstructions()}
				<div className="clearing" />
			</div>
		</div>
	);
}


WeavingInstructionsAllTogetherPrint.propTypes = {
	'numberOfRows': PropTypes.number.isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired, // updated in state
};

function mapStateToProps(state) {
	return {
		'patternDesign': state.pattern.patternDesign,
	};
}

export default connect(mapStateToProps)(WeavingInstructionsAllTogetherPrint);
