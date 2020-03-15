import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { SVGBackwardWarp, SVGForwardWarp, SVGIdle } from '../modules/svg';
import { DEFAULT_PALETTE } from '../../modules/parameters';
import {
	editHoleHandedness,
} from '../modules/pattern';
import './Notation.scss';

function Notation(props) {
	const {
		_id,
		dispatch,
		holeHandedness,
		patternType,
	} = props;
	let tabletLabelsImage = '/images/tablet_labels.png';

	if (holeHandedness === 'anticlockwise') {
		tabletLabelsImage = '/images/tablet_labels_rev.png';
	}

	const handleClickChangeHandedness = () => {
		dispatch(editHoleHandedness({ _id }));
	};

	let handednessButton;

	if (patternType === 'freehand') {
		handednessButton = (
			<Button
				color="primary"
				onClick={handleClickChangeHandedness}
				title="Change handedness of tablet labels"
			>
				Change direction of ABCD
			</Button>
		);
	}

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
				<p>A circle means don&apos;t turn the tablet this pick.</p>
			</div>
			<h2>Tablet labels</h2>
			<img src={tabletLabelsImage} alt="Tablet labels" title="Labels and turning direction" width="237" height="148" />
			<p className="hint">The arrows show turning the tablet forwards.</p>
			{handednessButton}
		</div>
	);
}

Notation.propTypes = {
	'_id': PropTypes.string,
	'dispatch': PropTypes.func,
	'holeHandedness': PropTypes.string,
	'patternType': PropTypes.string,
};

export default Notation;
