// kick off the data migration process
// on the live server this should run exactly once
// and then be disabled and never spoken of again

import migratePatternsMetadata from './migratePatternsMetadata';
import migratePatternsDesign from './migratePatternsDesign';

const migrateUserProfiles = () => {
	console.log('*** starting to migrate user profiles');
	const allUsers = Meteor.users.find().fetch();
	console.log('number of users', allUsers.length);

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

const fixRoles = () => {
	// the roles package migration doesn't carry over correctly.
	// all users should have the role 'registered
	// premium roles are lost
	// verified is assigned twice to some users by mistake
	const premiumUsers = [ // have premium role in TWT1
		'2r9oYwLH7CyHz2MWM',
		'GCGSnKXqu4dQTT9XN',
		't3FnL8gyWBxqAyeRW',
		'w43KReXaSzHrtheNZ',
		'xkqJj2qXrBxEnXyah',
		'ydgxPdGdrtE2MK2AM',
	];

	// duplicate entries in role-assignment, verified
	const duplicateUsers = [
		'ydgxPdGdrtE2MK2AM', // me!
		'xkqJj2qXrBxEnXyah',
		'eWaetJSL7RE2sqG5W',
		'9cA56RaRWEBkic7Y6',
	];

	// duplicate 'verified' entries have got in somehow
	// removing the users from the roles takes out one entry
	// for some reason getRolesForUser then correctly returns not in role, but I don't like having a mysteriously inactive entry in roles-assignment. So take them all out and readd the roles for these four users.
	duplicateUsers.forEach((userId) => {
		Meteor.roleAssignment.remove({ 'user._id': userId });
		console.log('duplicate user', userId);
		console.log('getRolesForUser duplicated after remove', Roles.getRolesForUser(userId));
		Roles.addUsersToRoles(userId, 'verified');
		console.log('getRolesForUser duplicated after readd', Roles.getRolesForUser(userId));
	});

	// four of the premium users don't appear as verified, but they should
	premiumUsers.forEach((userId) => {
		console.log('premium user', userId);
		Roles.addUsersToRoles(userId, 'premium');
		console.log('getRolesForUser premium', Roles.getRolesForUser(userId));
	});

	const allUsers = Meteor.users.find().fetch();
	let notRegisteredCount = 0;
	let registeredCount = 0;

	allUsers.forEach((user) => {
		if (Roles.userIsInRole(user._id, 'registered')) {
			registeredCount += 1;
		} else {
			//console.log('user not registered', user._id);
			//console.log('has roles', Roles.getRolesForUser(user._id));
			notRegisteredCount += 1;
			Roles.addUsersToRoles(user._id, 'registered');
		}
	});
	console.log('notRegisteredCount', notRegisteredCount);
	console.log('registeredCount', registeredCount);

	// the data migration doesn't seem to work right. Best might be to delete the roles-assignment collection and rebuild verified from emails.

	
};

const runDataMigration = () => {
	console.log('*** run migration');

	// Migrate roles from 1.x to 3.x
	//Package['alanning:roles'].Roles._forwardMigrate();
	//Package['alanning:roles'].Roles._forwardMigrate2();
	fixRoles();

	//migrateUserProfiles();
	//migratePatternsMetadata();
	migratePatternsDesign();
};

export default runDataMigration;
