// return an array of the user's recently viewed patterns
// most recent first

import { Patterns } from '../../modules/collection';
import { getLocalStorageItem } from './localStorage';

const findRecentPatterns = () => {
	let recentPatterns = [];
	let recentPatternsList = [];

	if (Meteor.user()) {
		recentPatternsList = Meteor.user().profile.recentPatterns;
	} else {
		recentPatternsList = JSON.parse(getLocalStorageItem('recentPatterns'));
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
