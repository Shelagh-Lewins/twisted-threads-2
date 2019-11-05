import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { addPattern } from '../modules/pattern';

function AddPattern({ dispatch }) {
	let input;
	return (
		<div>
			<input ref={(node) => {
				input = node;
			}}
			/>
			<button
				type="button"
				onClick={() => {
					dispatch(addPattern(input.value));
					input.value = '';
				}}
			>
				Add Pattern
			</button>
		</div>
	);
}

AddPattern.propTypes = {
	'dispatch': PropTypes.func.isRequired,
};

export default connect()(AddPattern);
