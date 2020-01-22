import '../imports/modules/collection';
import { Patterns } from '../imports/modules/collection';
import '../imports/server/modules/publications';
import '../imports/server/modules/slingshot';
import { ROLES } from '../imports/modules/parameters';

Meteor.startup(() => {
	Accounts.config({
		'sendVerificationEmail': true,
	});

	Accounts.emailTemplates.siteName = 'Twisted Threads';
	Accounts.emailTemplates.from = 'Twisted Threads <no-reply@twistedthreads.org>';
	Accounts.emailTemplates.verifyEmail.subject = (user) => 'Verify your email address';
	Accounts.emailTemplates.verifyEmail.text = (user, url) => {
		const urlWithoutHash = url.replace('#/', '');
		return `Hello ${user.username},\n\nYou have registered a new email address on Twisted Threads. To verify your email address, please click the link below:\n\n ${urlWithoutHash}`;
	};
	Accounts.emailTemplates.resetPassword.subject = (user) => 'Reset your password';
	Accounts.emailTemplates.resetPassword.text = (user, url) => {
		const urlWithoutHash = url.replace('#/', '');
		return `Hello ${user.username},\n\nTo reset your password on Twisted Threads, please click the link below.:\n\n ${urlWithoutHash}`;
	};

	// ensure user roles exist
	ROLES.forEach((role) => {
		Roles.createRole(role, { 'unlessExists': true });
	});

	// make sure the current user has correct role based on whether their email address is verified
	Meteor.users.find().observeChanges({
		'changed': function (_id) {
			const user = Meteor.users.findOne({ _id });
			if (!user) {
				return;
			}
console.log('*** server/main.js users observeChanges');
			try {
				if (user.emails[0].verified) {
					Roles.addUsersToRoles(_id, ['verified']);
				} else {
					Roles.removeUsersFromRoles(_id, ['verified']);
				}
			} catch (err) {
				console.log(`error checking roles for user ${_id}`);
			}
		},
	});
});

Accounts.onCreateUser((options, user) => {
	const newUser = { ...user };
	// We still want the default hook's 'profile' behavior.
	newUser.profile = options.profile || {};
	newUser.profile.nameSort = user.username.toLowerCase();

	// assign the user the default role
	Roles.addUsersToRoles(newUser._id, 'registered');

	return newUser;
});
