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
			<h2>Notation</h2>
			<h3>Tablet labels</h3>
			<img src={tabletLabelsImage} alt="Tablet labels" title="Labels and turning direction" width="237" height="148" />
			<p className="hint">The diagram above shows how to label the tablets, which face LEFT as you look from the woven band.</p>
			<p className="hint">The arrows show the forward turning direction.</p>
			{handednessButton}
			<div className="weaving-chart-key">
				<h3>Weaving chart key</h3>
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
				<p>Shaded background means turn the tablet backwards. The coloured shape shows the visible thread colour and angle.</p>
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
