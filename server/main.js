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
});

Accounts.onCreateUser((options, user) => {
	const newUser = { ...user };
	// We still want the default hook's 'profile' behavior.
	newUser.profile = options.profile || {};
	newUser.profile.name_sort = user.username.toLowerCase();
	return newUser;
});
