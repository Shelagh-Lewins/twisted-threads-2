import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

import './FlashMessage.scss';

// onClick should dismiss the condition that caused the FlashMessage to be displayed
// it is the responsibility of the component that triggers the FlashMessage, to also provide the way to dismiss it
export default function FlashMessage({ message, type, onClick }) {
	return (
		<div className={`flash-message ${type}`}>
			<span>{message}</span>
			<Button
				type='button'
				className='btn-close'
				aria-label='Close'
				title='Close'
				onClick={onClick}
			/>
		</div>
	);
}

FlashMessage.propTypes = {
	message: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	type: PropTypes.string.isRequired,
};
