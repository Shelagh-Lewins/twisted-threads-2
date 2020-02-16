// returns an array of pattern summaries
// for use in PaginatedList

import React from 'react';
import PropTypes from 'prop-types';
import PatternSummary from './PatternSummary';

const PatternList = (props) => {
	const {
		dispatch,
		handleClickButtonRemove,
		onChangeIsPublic,
		patterns,
		patternPreviews,
		tags,
		users,
	} = props;

	if (patterns.length === 0) {
		return (
			<div className="empty">There are no patterns to display</div>
		);
	}

	return patterns.map((pattern) => {
		const { _id, createdBy, 'tags': patternTags } = pattern;

		const tagTexts = [];

		// ensure tags subscription is ready
		if (patternTags && tags && tags.length > 0) {
			patternTags.forEach((patternTag) => {
				const tagObject = tags.find((tag) => tag._id === patternTag);
				if (tagObject && tagObject.name) {
					tagTexts.push(tagObject.name);
				}
			});
		}

		return (
			<div key={`pattern-summary-${_id}`}>
				<PatternSummary
					dispatch={dispatch}
					handleClickButtonRemove={handleClickButtonRemove}
					onChangeIsPublic={onChangeIsPublic}
					pattern={pattern}
					patternPreview={patternPreviews.find((patternPreview) => patternPreview.patternId === _id)}
					tagTexts={tagTexts}
					user={users.find((user) => user._id === createdBy)}
				/>
			</div>
		);
	});
};

PatternList.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default PatternList;
