import React from 'react';
import './Notation.scss';

function Notation() {
	return (
		<div className="notation">
			<h2>Notation</h2>
			<img src="/images/tablet_labels.png" alt="Tablet labels" title="Labels and turning direction" width="237" height="148" />
			<p className="hint">The arrows show turning the tablet forwards.</p>
			<p className="hint">In the weaving chart, gray background indicates to turn the tablet backwards.</p>
		</div>
	);
}

export default Notation;
