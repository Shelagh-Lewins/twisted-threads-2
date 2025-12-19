const sinon = require('sinon');
import { Roles } from 'meteor/roles';

export async function stubUser(params) {
  // create a fake logged in user
  Meteor.users.removeAsync({});
  const currentUser = Factory.create('user', params);
  if (Roles && typeof Roles.createRoleAsync === 'function') {
    await Roles.createRoleAsync('registered', { unlessExists: true });
    await Roles.addUsersToRolesAsync(currentUser._id, ['registered']);
  } else if (Roles && typeof Roles.createRole === 'function') {
    Roles.createRole('registered', { unlessExists: true });
    Roles.addUsersToRoles(currentUser._id, ['registered']);
  } else {
    console.warn('[roles] Roles APIs not available; skipping role assignment in stubUser');
  }

  sinon.stub(Meteor, 'userAsync');
  Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

  sinon.stub(Meteor, 'userId');
  Meteor.userId.returns(currentUser._id);

  return currentUser;
}

// to test user not logged in, we need to stub no user
// otherwise Meteor.userAsync() in publications throws an error
export function stubNoUser() {
  Meteor.users.removeAsync({});

  sinon.stub(Meteor, 'userAsync');
  Meteor.userAsync.returns(undefined); // now Meteor.userAsync() will return nothing

  sinon.stub(Meteor, 'userId');
  Meteor.userId.returns(undefined);

  return undefined;
}

export function unwrapUser() {
  Meteor.userAsync.restore(); // Unwraps the spy
  Meteor.userId.restore();
}

export function logOutButLeaveUser() {
  unwrapUser();
  sinon.stub(Meteor, 'userAsync');
  Meteor.userAsync.returns(undefined); // now Meteor.userAsync() will return nothing

  sinon.stub(Meteor, 'userId');
  Meteor.userId.returns(undefined);

  return undefined;
}

export async function stubOtherUser() {
  // create a new fake logged in user
  unwrapUser();
  const currentUser = Factory.create('user', {
    username: 'Bob',
    emails: [
      {
        address: 'bob@there.com',
        verified: true,
      },
    ],
    publicPatternsCount: 0,
    publicColorBooksCount: 0,
  });
  if (Roles && typeof Roles.createRoleAsync === 'function') {
    await Roles.createRoleAsync('registered', { unlessExists: true });
    await Roles.addUsersToRolesAsync(currentUser._id, ['registered']);
  } else if (Roles && typeof Roles.createRole === 'function') {
    Roles.createRole('registered', { unlessExists: true });
    Roles.addUsersToRoles(currentUser._id, ['registered']);
  } else {
    console.warn('[roles] Roles APIs not available; skipping role assignment in stubOtherUser');
  }

  sinon.stub(Meteor, 'userAsync');
  Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

  sinon.stub(Meteor, 'userId');
  Meteor.userId.returns(currentUser._id);

  return currentUser;
}

// ////////////////////////
// lots of users
export function createManyUsers() {
  const numberOfUsersWithPublicPatterns = 23;
  const numberOfUsersWithPrivatePatterns = 13;

  const publicPatternUserIds = [];
  const privatePatternUserIds = [];

  const publicPatternUsernames = [];
  const privatePatternUsernames = [];

  Meteor.users.removeAsync({});

  for (let i = 0; i < numberOfUsersWithPublicPatterns; i += 1) {
    const username = `username_${i}_public`;
    const user = Factory.create('user', {
      username,
      nameSort: username,
      emails: [
        {
          address: `${username}@here.com`,
          verified: true,
        },
      ],
      publicPatternsCount: i + 1,
      publicColorBooksCount: 0,
    });

    publicPatternUserIds.push(user._id);
    publicPatternUsernames.push(user.username);
  }

  for (let i = 0; i < numberOfUsersWithPrivatePatterns; i += 1) {
    const username = `username_${i}_private`;
    const user = Factory.create('user', {
      username,
      nameSort: username,
      emails: [
        {
          address: `${username}@here.com`,
          verified: true,
        },
      ],
      publicPatternsCount: 0,
      publicColorBooksCount: 0,
    });

    privatePatternUserIds.push(user._id);
    privatePatternUsernames.push(user.username);
  }

  return {
    publicPatternUserIds,
    privatePatternUserIds,
    publicPatternUsernames,
    privatePatternUsernames,
    numberOfUsersWithPublicPatterns,
    numberOfUsersWithPrivatePatterns,
  };
}
