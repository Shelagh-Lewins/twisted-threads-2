// Shown after successful registration of a new user

import React from 'react';

export default function Welcome() {
	return (
		<div>
			<h2>Welcome to the Demo App</h2>
			<p>Your account has been created.</p>
			<p>To create patterns, you will need to verify your email address. An email containing a verification link has been sent to the email address with which you registered. Please click the link to verify your email address.</p>
			<p>If you do not receive the email within a few minutes, please check your Junk or Spam folder.</p>
			<p>You can request a new registration email on your user account page (click your username in the header bar).</p>
		</div>
	);
}
