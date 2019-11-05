import Patterns from '../imports/collection';

const patternPublishFields = {
	'count': 1,
	'name': 1,
};

const getPatternPublication = function (pageSkip = 0) {
	const query = {};

	Counts.publish(this, 'PatternCount', Patterns.find(query)); // eslint-disable-line no-undef

	return Patterns.find({},
		{
			'fields': patternPublishFields,
			'skip': pageSkip,
			'limit': 10,
		});
};

Meteor.publish('getPatterns', getPatternPublication);

