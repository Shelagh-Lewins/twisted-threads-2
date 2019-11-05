import React from 'react';
import { connect } from 'react-redux';
import { addPattern } from '../modules/pattern';

function AddTodo({ dispatch }) {
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
					console.log('YO');
					dispatch(addPattern(input.value));
					input.value = '';
				}}
			>
				Add Pattern
			</button>
		</div>
	);
}

export default connect()(AddTodo);
