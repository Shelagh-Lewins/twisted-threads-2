import React from 'react';
import './DonatePatreon.scss';

function DonatePatreon() {
	return (
		<div className="donate-patreon" title="Support Twisted Threads on Patreon">
			<span className="patreon-logo"><svg viewBox="0 0 569 546" xmlns="http://www.w3.org/2000/svg"><g><circle cx="362.589996" cy="204.589996" fill="#fff" id="Oval" r="204.589996" /><rect fill="#000" height="545.799988" id="Rectangle" width="100" x="0" y="0" /></g></svg></span>
			<a href="https://www.patreon.com/bePatron?u=31384826"  target="_blank" rel="noreferrer noopener"data-patreon-widget-type="become-patron-button">Become a Patron!</a><script async src="https://c6.patreon.com/becomePatronButton.bundle.js" />
		</div>
	);
}

export default DonatePatreon;
