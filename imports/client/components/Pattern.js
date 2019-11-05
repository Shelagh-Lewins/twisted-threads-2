import React from 'react';

export default function Todo({ onClick, completed, text, testArray }) {
	console.log('in todo', text);
	console.log('testArray', testArray);
	return (
		<li
			onClick={onClick}
			style={{textDecoration: completed ? 'line-through' : 'none'}}
		>
			{text}
			{testArray}
		</li>
	);
}
