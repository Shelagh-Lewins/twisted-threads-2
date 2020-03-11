// kick off the data migration process
// on the live server this should run exactly once
// and then be disabled and never spoken of again

import migratePatternsMetadata from './migratePatternsMetadata';
import migrateTags from './migrateTags';
import migratePatternsDesign from './migratePatternsDesign';
import migrateImages from './migrateImages';
import { ROLES } from '../../imports/modules/parameters';

// various info that was in the profile is now in the main user record
// profile is confusing with the auto-publish for self
// it is now used only for recent patterns, which never need to be shown to another user
const migrateUserProfiles = () => {
	console.log('*** starting to migrate user profiles');
	const allUsers = Meteor.users.find().fetch();
	console.log('number of users', allUsers.length);

	allUsers.map((user) => {
		const oldProfile = user.profile;
		const oldRecentPatterns = user.profile.recent_patterns;
		let newRecentPatterns = [];

		if (oldRecentPatterns) {
			newRecentPatterns = oldRecentPatterns.map((recentPattern) => ({
				'patternId': recentPattern.pattern_id,
				'updatedAt': new Date(recentPattern.accessed_at),
				'currentWeavingRow': recentPattern.current_weave_row,
			}));
		}

		const newProfile = {
			'recentPatterns': newRecentPatterns,
		};

		const publicPatternsCount = oldProfile.public_patterns_count;

		Meteor.users.update({ '_id': user._id },
			{
				'$set': {
					'description': oldProfile.description,
					'nameSort': user.username.toLowerCase(),
					'profile': newProfile,
					'publicPatternsCount': publicPatternsCount,
					'publicColorBooksCount': 0,
				},
			});
	});

	console.log('*** finished migrating user profiles');
};

const fixRoles = () => {
	// after migration from Roles 1.x, 2.x, some users are entered in role-assignment twice as verified
	// and 'premium' was never properly added to the roles list in TWT1 so is not carried over
	// ensure user roles exist
	ROLES.forEach((role) => {
		Roles.createRole(role, { 'unlessExists': true });
	});

	const premiumUsers = [ // have premium role in TWT1
		'2r9oYwLH7CyHz2MWM',
		'GCGSnKXqu4dQTT9XN',
		't3FnL8gyWBxqAyeRW',
		'w43KReXaSzHrtheNZ',
		'xkqJj2qXrBxEnXyah',
		'ydgxPdGdrtE2MK2AM',
		'9wmmhS33b3JDR8Qu7', // neffnan
	];

	// administrators are identified by _id AND username, to be extra careful
	const administrators = [
		{ '_id': 'ydgxPdGdrtE2MK2AM', 'username': 'Shelagh' },
	];

	// duplicate entries in role-assignment, verified as of 29 Feb 2020
	/* const duplicateUsers = [
		'ydgxPdGdrtE2MK2AM', // me!
		'xkqJj2qXrBxEnXyah',
		'eWaetJSL7RE2sqG5W',
		'9cA56RaRWEBkic7Y6',
	]; */

	// removing the duplicate users from the roles takes out only one entry
	// although getRolesForUser then correctly returns not in role, I don't like having a mysteriously inactive entry in roles-assignment. So delete all role assignments and recreate

	Meteor.roleAssignment.remove({}); // we're going to rebuild this from scratch

	administrators.forEach((user) => {
		const { _id, username } = user;

		const userFromDB = Meteor.users.find({ _id, username });

		if (userFromDB) {
			console.log('adding administrator user', _id);
			Roles.addUsersToRoles(_id, 'administrator');
		} else {
			console.log('administrator user not found', _id);
		}
		console.log('');
	});

	// four of the premium users don't appear as verified, but they should
	premiumUsers.forEach((userId) => {
		console.log('adding premium user', userId);
		Roles.addUsersToRoles(userId, 'premium');
		// console.log('getRolesForUser premium', Roles.getRolesForUser(userId));
	});

	console.log('');

	const allUsers = Meteor.users.find().fetch();

	allUsers.forEach((user) => {
		if (!Roles.userIsInRole(user._id, 'registered')) {
			Roles.addUsersToRoles(user._id, 'registered');
		}

		try {
			if (user.emails[0].verified) {
				Roles.addUsersToRoles(user._id, ['verified']);
			} else {
				Roles.removeUsersFromRoles(user._id, ['verified']);
			}
		} catch (err) {
			console.log(`error checking roles for user ${user._id}`);
		}
	});
};

const runDataMigration = () => {
	console.log('*** run migration');

	// Migrate roles from 1.x to 3.x
	Package['alanning:roles'].Roles._forwardMigrate();
	Package['alanning:roles'].Roles._forwardMigrate2();
	fixRoles();

	migrateUserProfiles();
	migratePatternsMetadata();
	migrateTags();
	migratePatternsDesign();
	migrateImages();

	// remove unwanted collections
	// declare it so we can manipulate it in meteor
	const actions_log = new Mongo.Collection('actions_log');
	actions_log.rawCollection().drop();
};

export default runDataMigration;
