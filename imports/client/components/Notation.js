import React from 'react';
import { SVGIdle } from '../modules/svg';
import './Notation.scss';

function Notation() {
	return (
		<div className="notation">
			<div className="weaving-chart-key">
				<h2>Weaving chart key</h2>
				<span className="item">
					<span className="cell forward" />
					<span className="text">Turn tablet forward</span>
				</span>
				<span className="item">
					<span className="cell backward" />
					<span className="text">Turn tablet backward</span>
				</span>
				<span className="item">
					<span className="cell idle">
						<SVGIdle
							fill="transparent"
							stroke="#000000"
						/>
					</span>
					<span className="text">Idle tablet</span>
				</span>
			</div>
			<h2>Tablet labels</h2>
			<img src="/images/tablet_labels.png" alt="Tablet labels" title="Labels and turning direction" width="237" height="148" />
			<p className="hint">The arrows show turning the tablet forwards.</p>
		</div>
	);
}

export default Notation;
