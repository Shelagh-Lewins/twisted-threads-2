import Patterns from '../imports/collection';

Meteor.methods({
	addPattern(text) {
		console.log('in add pattern method with text', text);
		const patterns = Patterns.insert({
			'name': text,
		});
		return patterns;
	},
});
