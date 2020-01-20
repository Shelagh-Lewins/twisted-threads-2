// return an array of the user's recently viewed patterns
// most recent first
// this includes the full pattern data

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
			//console.log('findRecentPatterns.js handle2 ready', Patterns.find({_id: 'HLpMPYP6Eja3wd5rg'}).fetch());
			secondaryPatternSubscriptions(recentPatterns);
		},
	});


//console.log('findRecentPatterns has patterns', recentPatterns);
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
