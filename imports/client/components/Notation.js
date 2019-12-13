import React from 'react';
import { SVGBackwardWarp, SVGForwardWarp, SVGIdle } from '../modules/svg';
import { DEFAULT_PALETTE } from '../../modules/parameters';
import './Notation.scss';

function Notation() {
	return (
		<div className="notation">
			<div className="weaving-chart-key">
				<h2>Weaving chart key</h2>
				<span className="item">
					<span className="cell forward">
						<SVGForwardWarp
							fill={DEFAULT_PALETTE[0]}
							stroke="#000000"
						/>
					</span>
					<span className="text">Turn tablet forward</span>
				</span>
				<span className="item">
					<span className="cell backward">
						<SVGBackwardWarp
							fill={DEFAULT_PALETTE[0]}
							stroke="#000000"
						/>
					</span>
					<span className="text">Turn tablet backward</span>
				</span>
				<p>Grey background in the table cell means turn the tablet backwards: the shape shows the visible thread colour and angle.</p>
				<span className="item">
					<span className="cell idle">
						<SVGIdle
							fill={DEFAULT_PALETTE[0]}
							stroke="#000000"
						/>
					</span>
					<span className="text">Idle tablet</span>
				</span>
				<p>A circle means don&apos;t turn the tablet at all this pick.</p>
			</div>
			<h2>Tablet labels</h2>
			<img src="/images/tablet_labels.png" alt="Tablet labels" title="Labels and turning direction" width="237" height="148" />
			<p className="hint">The arrows show turning the tablet forwards.</p>
		</div>
	);
}

export default Notation;
