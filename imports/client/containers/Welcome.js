// Shown after successful registration of a new user

import React from 'react';
import {
	Container,
	Row,
	Col,
} from 'reactstrap';

export default function Welcome() {
	return (
		<Container>
			<Row>
				<Col>
					<h2>Welcome to the Demo App</h2>
					<p>Your account has been created.</p>
					<p>An email containing a verification link has been sent to the email address with which you registered. Please click the link to verify your email address. This will allow you to create more patterns.</p>
					<p>If you do not receive the email within a few minutes, please check your Junk or Spam folder.</p>
					<p>You can request a new registration email on your user account page (click your username in the header bar).</p>
				</Col>
			</Row>
		</Container>
	);
}
