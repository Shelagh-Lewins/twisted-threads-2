import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
	getPalette,
} from '../modules/pattern';
import FreehandSVG from './FreehandSVG';
import {
	DEFAULT_DIRECTION,
} from '../../modules/parameters';

import './FreehandThreads.scss';

function FreehandThreads(props) {
	const {
		palette,
		selectThread,
		selectedThread,
		threadColorIndex,
	} = props;

	const svgNames = [
		'idle',
		'backwardEmpty',
		'forwardEmpty',
		'backwardWarp',
		'backwardWarp2',
		'backwardWarp3',
		'forwardWarp',
		'forwardWarp2',
		'forwardWarp3',
		'verticalLeftWarp',
		'verticalCenterWarp',
		'verticalRightWarp',
		'block',
	];

	const renderThreads = () => svgNames.map((svgName) => {
		const chartCell = {
			'direction': DEFAULT_DIRECTION,
			'threadColor': threadColorIndex,
			'threadShape': svgName,
		};

		return (
			<li
				className={selectedThread === svgName ? 'selected' : ''}
				key={`freehand-thread-${svgName}`}
				onClick={() => selectThread(svgName)}
				onKeyPress={() => selectThread(svgName)}
				role="menuitem"
				tabIndex="0"
			>
				<FreehandSVG
					chartCell={chartCell}
					palette={palette}
				/>
			</li>
		);
	});

	return (
		<div className="freehand-threads">
			<ul>
				{renderThreads()}
			</ul>
		</div>
	);
}

FreehandThreads.propTypes = {
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'threadColorIndex': PropTypes.number.isRequired,
	'selectThread': PropTypes.func.isRequired,
	'selectedThread': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'palette': getPalette(state),
	};
}

export default connect(mapStateToProps)(FreehandThreads);
