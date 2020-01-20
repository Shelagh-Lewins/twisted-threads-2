// return an array of the user's recently viewed patterns
// most recent first
// this includes the full pattern data
// and adds the date viewed from the list in the user's profile or local storage
// This can be used to find the count of recent patterns for pagination
// the client will then need to truncate the array for display

import { Patterns } from '../../modules/collection';
import { getLocalStorageItem } from './localStorage';
import secondaryPatternSubscriptions from './secondaryPatternSubscriptions';

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

	const handle = Meteor.subscribe('patternsById', patternIds, {
		'onReady': () => {
			secondaryPatternSubscriptions(recentPatterns);
		},
	});

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

	return { 'ready': handle.ready(), recentPatterns };
};

export default findRecentPatterns;
