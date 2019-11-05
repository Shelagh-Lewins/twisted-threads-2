import Patterns from '../imports/collection';

const patternPublishFields = {
	'name': 1,
};

Meteor.publish('getPatterns', () => {
	return Patterns.find({},
		{ 'fields': patternPublishFields });
});
