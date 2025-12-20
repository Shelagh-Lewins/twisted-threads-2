const sinon = require('sinon');
import { Roles } from 'meteor/roles';

// Default user data
const defaultUserData = {
  username: 'Jennifer',
  nameSort: 'jennifer',
  emails: [
    {
      address: 'jennifer@here.com',
      verified: true,
    },
  ],
  publicPatternsCount: 0,
  publicColorBooksCount: 0,
  weavingBackwardsBackgroundColor: '#aabbcc',
};

export async function stubUser(params = {}) {
  // create a fake logged in user
  await Meteor.users.removeAsync({});

  const userData = { ...defaultUserData, ...params };
  const userId = await Meteor.users.insertAsync(userData);
  const currentUser = await Meteor.users.findOneAsync(userId);

  if (Roles && typeof Roles.createRoleAsync === 'function') {
    await Roles.createRoleAsync('registered', { unlessExists: true });
    await Roles.addUsersToRolesAsync([userId], ['registered']);
  } else if (Roles && typeof Roles.createRole === 'function') {
    Roles.createRole('registered', { unlessExists: true });
    Roles.addUsersToRoles([userId], ['registered']);
  } else {
    console.warn(
      '[roles] Roles APIs not available; skipping role assignment in stubUser',
    );
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

// Helper to create user directly without Roles
export async function createUser(params = {}) {
  const userData = { ...defaultUserData, ...params };
  const userId = await Meteor.users.insertAsync(userData);
  return Meteor.users.findOneAsync(userId);
}

export function unwrapUser() {
  // Check if stubs exist before restoring
  if (Meteor.userAsync && typeof Meteor.userAsync.restore === 'function') {
    Meteor.userAsync.restore(); // Unwraps the spy
  }
  if (Meteor.userId && typeof Meteor.userId.restore === 'function') {
    Meteor.userId.restore();
  }
}

// Helper to call Meteor methods with userId context
// This ensures this.userId is set properly in the method
export async function callMethodWithUser(userId, methodName, ...args) {
  const methodHandler = Meteor.server.method_handlers[methodName];
  if (!methodHandler) {
    throw new Error(`Method ${methodName} not found`);
  }

  // Create a method invocation context with userId
  const context = {
    userId,
    connection: { id: 'test-connection' },
    setUserId: () => {},
    unblock: () => {},
  };

  // Call the method with the proper context
  return await methodHandler.apply(context, args);
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

  const userData = {
    username: 'Bob',
    nameSort: 'bob',
    emails: [
      {
        address: 'bob@there.com',
        verified: true,
      },
    ],
    publicPatternsCount: 0,
    publicColorBooksCount: 0,
  };

  const userId = await Meteor.users.insertAsync(userData);
  const currentUser = await Meteor.users.findOneAsync(userId);

  if (Roles && typeof Roles.createRoleAsync === 'function') {
    await Roles.createRoleAsync('registered', { unlessExists: true });
    await Roles.addUsersToRolesAsync([userId], ['registered']);
  } else if (Roles && typeof Roles.createRole === 'function') {
    Roles.createRole('registered', { unlessExists: true });
    Roles.addUsersToRoles([userId], ['registered']);
  } else {
    console.warn(
      '[roles] Roles APIs not available; skipping role assignment in stubOtherUser',
    );
  }

  sinon.stub(Meteor, 'userAsync');
  Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

  sinon.stub(Meteor, 'userId');
  Meteor.userId.returns(currentUser._id);

  return currentUser;
}

// ////////////////////////
// lots of users
export async function createManyUsers() {
  const numberOfUsersWithPublicPatterns = 23;
  const numberOfUsersWithPrivatePatterns = 13;

  const publicPatternUserIds = [];
  const privatePatternUserIds = [];

  const publicPatternUsernames = [];
  const privatePatternUsernames = [];

  await Meteor.users.removeAsync({});

  for (let i = 0; i < numberOfUsersWithPublicPatterns; i += 1) {
    const username = `username_${i}_public`;
    const userId = await Meteor.users.insertAsync({
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

    publicPatternUserIds.push(userId);
    publicPatternUsernames.push(username);
  }

  for (let i = 0; i < numberOfUsersWithPrivatePatterns; i += 1) {
    const username = `username_${i}_private`;
    const userId = await Meteor.users.insertAsync({
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

    privatePatternUserIds.push(userId);
    privatePatternUsernames.push(username);
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
