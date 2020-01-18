// return an array of the user's recently viewed patterns
// most recent first
// this includes only the recent pattern data, not the full pattern data

import { Patterns } from '../../modules/collection';
import { getLocalStorageItem } from './localStorage';

const findRecentPatterns = () => {
	let recentPatterns = [];
	let recentPatternsList = [];

	if (Meteor.user()) {
		recentPatternsList = Meteor.user().profile.recentPatterns;
	} else {
		const valueFromLocalStorage = JSON.stringify(getLocalStorageItem('recentPatterns'));

		if (valueFromLocalStorage !== null && typeof valueFromLocalStorage === 'object') {
			recentPatternsList = valueFromLocalStorage;
		}
	}

	const patternIds = recentPatternsList.map((pattern) => pattern.patternId);

	recentPatterns = Patterns.find(
		{
			'_id': { '$in': patternIds },
		},
	).fetch();

	recentPatterns = recentPatterns.map((pattern) => {
		const { updatedAt } = recentPatternsList.find(({ patternId }) => patternId === pattern._id);
		pattern.updatedAt = updatedAt;
		return pattern;
	});

	recentPatterns.sort((a, b) => {
		if (a.updatedAt < b.updatedAt) {
			return 1;
		}

		if (a.updatedAt > b.updatedAt) {
			return -1;
		}
		return 0;
	});

	return recentPatterns;
};

export default findRecentPatterns;
