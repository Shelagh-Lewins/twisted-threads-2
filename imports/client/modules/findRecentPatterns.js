// return an array of the user's recently viewed patterns
// most recent first

import { Patterns } from '../../modules/collection';

const findRecentPatterns = () => {
	let recentPatterns = [];

	if (Meteor.user()) {
		const { 'recentPatterns': recentPatternsList } = Meteor.user().profile;

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
	}

	return recentPatterns;
};

export default findRecentPatterns;
