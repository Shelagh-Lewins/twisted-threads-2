import { check } from 'meteor/check';
import { MAX_RECENTS } from '../../imports/modules/parameters';
import { Patterns } from '../../imports/modules/collection';
import {
	checkCanCreateColorBook,
	checkUserCanAddPatternImage,
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import updateActionsLog from '../../imports/server/modules/actionsLog';
import {
	getUserPermissionQuery,
} from '../../imports/modules/permissionQueries';

Meteor.methods({
	'auth.sendVerificationEmail': function (userId) {
		check(userId, nonEmptyStringCheck);

		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('send-verification-email-not-logged-in', 'Unable to send verification email because the user is not logged in');
		}

		updateActionsLog('verificationEmailSent');

		return Accounts.sendVerificationEmail(userId);
	},
	'auth.setRecentPatterns': function ({
		userId,
		newRecentPatterns,
	}) {
		check(userId, nonEmptyStringCheck);

		// recentPatterns is stored in Profile so that it is published to the user
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('add-recent-pattern-not-logged-in', 'Unable to add pattern to recents because the user is not logged in');
		}

		const recentPatterns = [];

		newRecentPatterns.forEach((entry) => {
			const { currentWeavingRow, patternId, updatedAt } = entry;

			check(patternId, String);
			check(updatedAt, Match.Where((value) => {
				if (isNaN(new Date(value).getTime())) {
					return false;
				}
				return true;
			}));

			const pattern = Patterns.findOne({ '_id': patternId });

			if (!pattern) {
				return;
			}

			// check in case of invalid weaving row
			check(currentWeavingRow, Match.Maybe(Number));
			if (currentWeavingRow < 0 || currentWeavingRow > pattern.numberOfRows) {
				entry.currentWeavingRow = 1;
			}

			recentPatterns.push(entry);
		});

		// the client provides an array of recent patterns with no duplicates and the most recent at the start
		// the server only checks that the total number of recents isn't exceeded

		// TO DO test

		while (recentPatterns.length > MAX_RECENTS) {
			recentPatterns.pop();
		}

		Meteor.users.update(
			{ '_id': Meteor.userId() },
			{ '$set': { 'profile.recentPatterns': recentPatterns } },
		);
	},
	'auth.checkUserCanCreateColorBook': function () {
		return checkCanCreateColorBook();
	},
	'auth.checkUserCanAddPatternImage': function ({ patternId }) {
		check(patternId, nonEmptyStringCheck);

		return checkUserCanAddPatternImage(patternId);
	},
	'auth.getUserCount': function () {
		// required for pagination
		// must return the same number as the relevant publications function

		// counts all users with public patterns
		// plus the user themselves if logged in

		// return all users visible to this user
		return Meteor.users.find(getUserPermissionQuery()).count();
	},
	'auth.editTextField': function ({ _id, fieldName, fieldValue }) {
		if (_id !== Meteor.userId()) {
			throw new Meteor.Error('edit-text-field-not-logged-in', 'Unable to edit text field because the user is not logged in');
		}

		check(fieldName, nonEmptyStringCheck);

		const optionalFields = [
			'description',
		];

		if (optionalFields.indexOf(fieldName) === -1) {
			check(fieldValue, nonEmptyStringCheck);
		} else {
			check(fieldValue, String);
		}

		const update = {};
		update[fieldName] = fieldValue;

		Meteor.users.update(
			{ '_id': Meteor.userId() },
			{ '$set': update },
		);
	},
	'auth.addUserToRole': function ({ _id, role }) {
		// user is logged in
		if (!Meteor.userId()) {
			throw new Meteor.Error('add-user-to-role-not-logged-in', 'Unable to add user to role because the current user is not logged in');
		}
		// user is administrator
		const userRoles = Roles.getRolesForUser(Meteor.userId());

		if (userRoles.indexOf('administrator') === -1) {
			throw new Meteor.Error('add-user-to-role-not-administrator', 'Unable to add user to role because the current user is not an administrator');
		}

		// user to add exists
		const userToAdd = Meteor.users.findOne({ _id });

		if (!userToAdd) {
			throw new Meteor.Error('add-user-to-role-user-not-found', 'Unable to add user to role because the user to add was not found');
		}

		// role exists
		const allRoles = Roles.getAllRoles().fetch();
		const thisRole = allRoles.find((roleObj) => roleObj._id === role);

		if (!thisRole) {
			throw new Meteor.Error('add-user-to-role-role-not-found', 'Unable to add user to role because the role was not found');
		}

		// user is not already in role
		const userToAddRoles = Roles.getRolesForUser(_id);

		if (userToAddRoles.indexOf(role) !== -1) {
			throw new Meteor.Error('add-user-to-role-already-in-role', 'Unable to add user to role because the user is already in the role');
		}

		Roles.addUsersToRoles(_id, [role]);

		return 'success';
	},
	'auth.removeUserFromRole': function ({ _id, role }) {
		// user is logged in
		if (!Meteor.userId()) {
			throw new Meteor.Error('add-user-to-role-not-logged-in', 'Unable to add user to role because the current user is not logged in');
		}
		// user is administrator
		const userRoles = Roles.getRolesForUser(Meteor.userId());

		if (userRoles.indexOf('administrator') === -1) {
			throw new Meteor.Error('remove-user-from-role-not-administrator', 'Unable to remove user from role because the current user is not an administrator');
		}

		// user to add exists
		const userToAdd = Meteor.users.findOne({ _id });

		if (!userToAdd) {
			throw new Meteor.Error('remove-user-from-role-user-not-found', 'Unable to remove user from role because the user to remove was not found');
		}

		// role exists
		const allRoles = Roles.getAllRoles().fetch();
		const thisRole = allRoles.find((roleObj) => roleObj._id === role);

		if (!thisRole) {
			throw new Meteor.Error('remove-user-from-role-role-not-found', 'Unable to remove user from role because the role was not found');
		}

		// user is in role
		const userToAddRoles = Roles.getRolesForUser(_id);

		if (userToAddRoles.indexOf(role) === -1) {
			throw new Meteor.Error('remove-user-from-role-not-in-role', 'Unable to remove user from role because the user is not in the role');
		}

		// do not allow administrator to remove themselves
		if (_id === Meteor.userId() && role === 'administrator') {
			throw new Meteor.Error('remove-user-from-role-administrator-not-remove-self', 'Unable to remove user from role because an administrator cannot remove themself');
		}

		Roles.removeUsersFromRoles(_id, [role]);

		return 'success';
	},
});
