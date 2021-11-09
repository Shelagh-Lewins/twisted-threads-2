import React from 'react';
import PropTypes from 'prop-types';

// onClick should dismiss the condition that caused the FlashMessage to be displayed
// it is the responsibility of the component that triggers the FlashMessage, to also provide the way to dismiss it
export default function TwistCalculationHints({
	canEdit,
	includeInTwist,
	patternIsTwistNeutral,
	patternType,
	patternWillRepeat,
	previewOrientation,
	printView,
	repeats,
}) {
	let hints = '';

	if (patternType !== 'freehand') {
		const anyExcluded = includeInTwist && includeInTwist.indexOf(false) !== -1;
		const allExcluded = includeInTwist && includeInTwist.indexOf(true) === -1;

		if (allExcluded) {
			// we cannot meaningfully say the pattern repeats or is twist neutral
			hints = (
				<span className="hint">Unable to determine whether the pattern will repeat or is twist neutral because all tablets have been excluded from twist calculations - check the threading chart.</span>
			);
		} else {
			const twistNeutralText = (
				<span className="hint">{patternIsTwistNeutral ? 'The pattern is twist neutral.' : 'The pattern is not twist neutral.'}</span>
			);

			let repeatHint = 'The pattern will not repeat.';

			if (patternWillRepeat) {
				if (printView) {
					repeatHint = 'The pattern will repeat.';
				} else {
					repeatHint = previewOrientation === 'up'
						? 'The pattern will repeat.'
						: `The pattern will repeat (${repeats} repeats shown).`;

					if (previewOrientation === 'up' && canEdit) {
						repeatHint += ' To see repeats, set the woven band orientation to left or right.';
					}
				}
			}

			const excludedTabletsText = anyExcluded
				? <span className="hint">Some tablets have been excluded from twist calculations - check the threading chart.</span>
				: undefined;

			hints = (
				<>
					{repeatHint}
					{twistNeutralText}
					{excludedTabletsText}
				</>
			);
		}
	}

	return hints;
}

TwistCalculationHints.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'includeInTwist': PropTypes.arrayOf(PropTypes.any),
	'patternIsTwistNeutral': PropTypes.bool.isRequired,
	'patternType': PropTypes.string.isRequired,
	'patternWillRepeat': PropTypes.bool.isRequired,
	'previewOrientation': PropTypes.string.isRequired,
	'printView': PropTypes.bool,
	'repeats': PropTypes.number,
};
