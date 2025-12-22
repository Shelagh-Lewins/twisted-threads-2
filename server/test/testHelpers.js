// Shared test helper functions for reuse across test files

import { expect } from 'chai';
import { Roles } from 'meteor/roles';
import { stubUser, callMethodWithUser } from './mockUser';
import { createPattern, addPatternDataIndividual } from './testData';
import { PatternImages, ColorBooks } from '../../imports/modules/collection';

/**
 * Create a pattern for a user
 * @param {Object} user - User object
 * @param {Object} patternDataOverride - Optional overrides for pattern data
 * @returns {Promise<string>} patternId
 */
export async function createPatternForUser(user, patternDataOverride = {}) {
  return await callMethodWithUser(user._id, 'pattern.add', {
    ...addPatternDataIndividual,
    ...patternDataOverride,
  });
}

/**
 * Insert a pattern image for a user and pattern
 * @param {Object} params - { patternId, user, key, url }
 * @returns {Promise<void>}
 */
export async function insertPatternImage({ patternId, user, key, url }) {
  await PatternImages.insertAsync({
    patternId,
    createdBy: user._id,
    createdAt: new Date(),
    key,
    url,
  });
}

/**
 * Insert a color book for a user
 * @param {Object} params - { user, name, nameSort, colors, isPublic }
 * @returns {Promise<void>}
 */
export async function insertColorBook({
  user,
  name,
  nameSort,
  colors = ['#fff'],
  isPublic = false,
}) {
  await ColorBooks.insertAsync({
    createdBy: user._id,
    name,
    nameSort,
    colors,
    createdAt: new Date(),
    isPublic,
  });
}
/**
 * Helper to create a user (via stubUser) and a pattern for that user, returns patternId
 * @param {string} userId - The user ID (default: 'testUserId')
 * @param {string[]} roles - Roles to assign (default: ['registered', 'verified'])
 * @param {Object} patternDataOverride - Optional pattern data overrides
 * @returns {Promise<string>} patternId
 */
export async function createUserAndPattern(
  userId = 'testUserId',
  roles = ['registered', 'verified'],
  patternDataOverride = {},
) {
  const currentUser = await stubUser({
    _id: userId,
    username: 'testuser',
    roles,
  });
  const patternData = {
    ...addPatternDataIndividual,
    createdBy: userId,
    ...patternDataOverride,
  };
  return callMethodWithUser(currentUser._id, 'pattern.add', patternData);
}

/**
 * Test that a method requires authentication
 * @param {string} methodName - The Meteor method name
 * @param {*} args - Arguments to pass to the method
 */
export async function testRequiresAuth(methodName, ...args) {
  await expect(Meteor.callAsync(methodName, ...args)).to.be.rejectedWith(
    '-not-logged-in',
  );
}

/**
 * Test that a method requires a specific role
 * @param {string} userId - User ID to test with
 * @param {string} roleName - Role to remove
 * @param {string} methodName - Method to call
 * @param {string} errorCode - Expected error code
 * @param {*} args - Method arguments
 */
export async function testRequiresRole(
  userId,
  roleName,
  methodName,
  errorCode,
  ...args
) {
  await Roles.removeUsersFromRolesAsync([userId], [roleName]);
  await expect(
    callMethodWithUser(userId, methodName, ...args),
  ).to.be.rejectedWith(errorCode);
}

/**
 * Create test patterns owned by other users
 * @param {number} count - Number of patterns to create
 * @returns {Array} Array of created pattern objects
 */
export async function createOtherUsersPatterns(count = 3) {
  const patterns = [];
  for (let i = 0; i < count; i += 1) {
    patterns.push(
      await createPattern({
        name: `Other Pattern ${i + 1}`,
        createdBy: `user_${i}`,
      }),
    );
  }
  return patterns;
}

/**
 * Create a set for a user with all required fields
 * @param {Object} params - { user, patterns, name, nameSort, description, tags, publicPatternsCount, createdAt }
 * @returns {Promise<string>} setId
 */
import { Sets } from '../../imports/modules/collection';
export async function createSetForUser({
  user,
  patterns = [],
  name = 'Test Set',
  nameSort = 'test set',
  description = '',
  tags = [],
  publicPatternsCount = 0,
  createdAt = new Date(),
} = {}) {
  return await Sets.insertAsync({
    createdBy: user._id,
    patterns,
    name,
    nameSort,
    description,
    tags,
    publicPatternsCount,
    createdAt,
  });
}
