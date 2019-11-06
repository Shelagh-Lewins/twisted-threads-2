import React from 'react';
import { Spinner } from 'reactstrap';
import './Loading.scss';

function Loading() {
	return (
		<div className="loading">
			<div className="inner-tube">
				<Spinner color="secondary" style={{ 'width': '3rem', 'height': '3rem' }} />
			</div>
		</div>
	);
}

export default Loading;
