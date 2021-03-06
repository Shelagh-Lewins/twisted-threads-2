// after subscribing to an array of patterns
// now subscribe to pattern previews and users
// for those patterns
const secondaryPatternSubscriptions = (patterns) => {
	const patternIds = patterns.map((pattern) => pattern._id);

	Meteor.subscribe('patternPreviews', { patternIds });

	const userIds = patterns.map((pattern) => pattern.createdBy);
	const uniqueUsers = [...(new Set(userIds))];

	Meteor.subscribe('users', uniqueUsers);
};

export default secondaryPatternSubscriptions;
