import '../imports/server/modules/publications';
import '../imports/server/modules/slingshot';
import { ROLES } from '../imports/modules/parameters';

import runDataMigration from './migration/runDataMigration';

const moment = require('moment');

Meteor.startup(() => {
	//TODO run this once live
	//and then remove it

	if (process.env.MIGRATIONS === 'migrations') {
		console.log('main says runDataMigration');
		runDataMigration(); // disabled while messing about with client
	} else {
		// ensure user roles exist
		// when migrating, this is done after migrating roles and before fixing them
		ROLES.forEach((role) => {
			Roles.createRole(role, { 'unlessExists': true });
		});
	}

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

		text += '\n\nAlternatively, you can enter the verification code below on your Account page in Twisted Threads:';

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

	return newUser;
});

// log failed login attempts so fail2ban can find them in the Nginx logs
Accounts.onLoginFailure(() => {
	const connection = Meteor.call('auth.getClientConnection');
	console.log(`${moment(new Date()).format('YYYY/MM/DD HH:mm:ss')} [error] 401: Meteor login failure, client: ${connection.clientAddress}, host: "${connection.httpHeaders.host}"`);
});
