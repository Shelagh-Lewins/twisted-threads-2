import React from 'react';
import { Container } from 'reactstrap';

function MaintenanceMode() {
	return (
		<div className="maintenance-mode">
			<Container>
				<h2>Maintenance Mode</h2>
				<p>We&apos;re currently doing some work on Twisted Threads. Please come back in a little while.</p>
			</Container>
		</div>
	);
}

export default MaintenanceMode;
