import React from 'react';

export default function Pattern({ name, id }) {
	console.log('in pattern', id);

	return (
		<div>
			Name: {name}
		</div>
	);
}
