const sinon = require('sinon');

export function stubUser(params) {
	// create a fake logged in user
	Meteor.users.remove({});
	const currentUser = Factory.create('user', params);
	sinon.stub(Meteor, 'user');
	Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created

	sinon.stub(Meteor, 'userId');
	Meteor.userId.returns(currentUser._id);

	return currentUser;
}

// to test user not logged in, we need to stub no user
// otherwise Meteor.user() in publications throws an error
export function stubNoUser() {
	Meteor.users.remove({});

	sinon.stub(Meteor, 'user');
	Meteor.user.returns(undefined); // now Meteor.user() will return nothing

	sinon.stub(Meteor, 'userId');
	Meteor.userId.returns(undefined);

	return undefined;
}

export function unwrapUser() {
	Meteor.user.restore(); // Unwraps the spy
	Meteor.userId.restore();
}

export function logOutButLeaveUser() {
	unwrapUser();
	sinon.stub(Meteor, 'user');
	Meteor.user.returns(undefined); // now Meteor.user() will return nothing

	sinon.stub(Meteor, 'userId');
	Meteor.userId.returns(undefined);

	return undefined;
}

export function stubOtherUser() {
	// create a new fake logged in user
	unwrapUser();
	const currentUser = Factory.create('user', {
		'username': 'Bob',
		'emails': [{
			'address': 'bob@there.com',
			'verified': true,
		}],
		'publicPatternsCount': 0,
		'publicColorBooksCount': 0,
	});
	sinon.stub(Meteor, 'user');
	Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created

	sinon.stub(Meteor, 'userId');
	Meteor.userId.returns(currentUser._id);

	return currentUser;
}
