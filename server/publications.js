import Patterns from '../imports/collection';

const patternPublishFields = {
	'name': 1,
};

Meteor.publish('getTodos', () => {
	return Patterns.find({},
		{ 'fields': patternPublishFields });
});
