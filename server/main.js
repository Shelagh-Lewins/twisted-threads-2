import '../imports/server/modules/publications';
import '../imports/server/modules/slingshot';
import { ROLES } from '../imports/modules/parameters';
import { buildServerLogText } from '../imports/server/modules/utils';

Meteor.startup(() => {
	// ensure user roles exist
	ROLES.forEach((role) => {
		Roles.createRole(role, { 'unlessExists': true });
	});

	Accounts.config({
		'sendVerificationEmail': true,
	});

	Accounts.emailTemplates.siteName = 'Twisted Threads';
	Accounts.emailTemplates.from = 'Twisted Threads <no-reply@twistedthreads.org>';
	Accounts.emailTemplates.verifyEmail.subject = (user) => 'Verify your email address';
	Accounts.emailTemplates.verifyEmail.text = (user, url) => {
		const urlWithoutHash = url.replace('#/', '');

		let text = `Hello ${user.username},\n\nThank you for registering with Twisted Threads, the online app for tablet weaving.`;

		text += '\n\nIn order to activate your account, please verify your email address be clicking the link below:';

		text += `\n\n${urlWithoutHash}`;

		text += '\n\nAlternatively, you can copy the verification code below and enter it on your Account page in Twisted Threads:';

		let code = urlWithoutHash.split('/');

		code = urlWithoutHash.split('/')[urlWithoutHash.split('/').length - 1];

		text += `\n\n${code}`;

		text += '\n\nBest wishes';

		text += '\n\nTwisted Threads';

		return text;
	};
	Accounts.emailTemplates.resetPassword.subject = (user) => 'Reset your password';
	Accounts.emailTemplates.resetPassword.text = (user, url) => {
		const urlWithoutHash = url.replace('#/', '');
		let text = `Hello ${user.username},\n\nTo reset your password on Twisted Threads, please click the link below.:\n\n ${urlWithoutHash}`;

		text += '\n\nBest wishes';

		text += '\n\nTwisted Threads';

		return text;
	};

	// make sure the current user has correct role based on whether their email address is verified
	Meteor.users.find().observeChanges({
		'changed': function (_id) {
			const user = Meteor.users.findOne({ _id });
			if (!user) {
				return;
			}

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
	newUser.nameSort = user.username.toLowerCase();
	newUser.publicPatternsCount = 0;
	newUser.publicColorBooksCount = 0;

	// assign the user the default role
	Roles.addUsersToRoles(newUser._id, 'registered');

	// log new user registrations so fail2ban can find them in the nginx logs
	const text = buildServerLogText('[action]: Meteor create user');
	console.log(text);

	return newUser;
});

// log failed login attempts so fail2ban can find them in the Nginx logs
Accounts.onLoginFailure(() => {
	const text = buildServerLogText('[error]: Meteor login failure');
	console.log(text);
});
