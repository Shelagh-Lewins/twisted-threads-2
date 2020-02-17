// kick off the data migration process
// on the live server this should run exactly once
// and then be disabled and never spoken of again

import migratePatterns from './migratePatterns';

const migrateUserProfiles = () => {
	console.log('*** starting to migrate user profiles');
	const allUsers = Meteor.users.find().fetch();

	allUsers.map((user) => {
		const oldProfile = user.profile;
		const oldRecentPatterns = user.profile.recent_patterns;
		let newRecentPatterns = [];

		if (oldRecentPatterns) {
			newRecentPatterns = oldRecentPatterns.map((recentPattern) => {
				return {
					'patternId': recentPattern.pattern_id,
					'updatedAt': new Date(recentPattern.accessed_at),
					'currentWeavingRow': recentPattern.current_weave_row,
				};
			});
		}

		/* if (user.username === 'Shelagh') {
			console.log('oldProfile', oldProfile);
			console.log('oldRecentPatterns', oldRecentPatterns);
			console.log('newRecentPatterns', newRecentPatterns);
		} */
		const newProfile = {
			'nameSort': oldProfile.name_sort,
			'recentPatterns': newRecentPatterns,

		};

		const publicPatternsCount = oldProfile.public_patterns_count;

		Meteor.users.update({ '_id': user._id },
			{
				'$set': {
					'profile': newProfile,
					'publicPatternsCount': publicPatternsCount,
					'publicColorBooksCount': 0,
				},
			});
	});

	console.log('*** finished migrating user profiles');
};

const runDataMigration = () => {
	console.log('*** run migration');

	// Migrate roles from 1.x to 3.x
	Package['alanning:roles'].Roles._forwardMigrate();
	Package['alanning:roles'].Roles._forwardMigrate2();

	migrateUserProfiles();
	migratePatterns();

	//TODO update count of public patterns for all users
};

export default runDataMigration;
