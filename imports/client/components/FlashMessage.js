import React from 'react';

// onClick should dismiss the condition that caused the FlashMessage to be displayed
// it is the responsibility of the component that triggers the FlashMessage, to also provide the way to dismiss it
export default function FlashMessage({ message, type, onClick }) {
	return (
		<div className={`flash-error ${type}`}>
			<span>{message}</span>
			<button type="button" className="close" aria-label="Close" onClick={onClick}>
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
	);
}
