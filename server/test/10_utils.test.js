import {
  DOUBLE_FACED_ORIENTATIONS,
  DEFAULT_ORIENTATION,
} from '../../imports/modules/parameters';
import { expect } from 'chai';
import { check } from 'meteor/check';
import * as utils from '../../imports/server/modules/utils';
import { ensureAllRolesExist } from './00_setup';
import {
  createPatternForUser,
  insertPatternImage,
  insertColorBook,
  createSetForUser,
  insertColorBookForUser,
} from './testHelpers';
import { ColorBooks } from '../../imports/modules/collection';
import { stubUser } from './mockUser';
import expectedDoubleFacedThreading from './expectedDoubleFacedThreading.js';
import expectedTwillThreading from './expectedTwillThreading.js';
import sinon from 'sinon';

describe('utils.js basic unit tests', () => {
  describe('nonEmptyStringCheck', () => {
    it('should pass check for non-empty string', () => {
      expect(() => check('abc', utils.nonEmptyStringCheck)).to.not.throw();
    });

    it('should fail check for empty string', () => {
      expect(() => check('', utils.nonEmptyStringCheck)).to.throw();
    });
  });

  describe('updateMultiplePublicSetsCount', () => {
    let user1, user2;
    let Sets;
    beforeEach(async () => {
      await ensureAllRolesExist();
      user1 = await stubUser({
        roles: ['registered', 'verified'],
        username: 'User1',
        emails: [{ address: 'user1@here.com', verified: true }],
      });
      user2 = await stubUser({
        roles: ['registered', 'verified'],
        username: 'User2',
        emails: [{ address: 'user2@here.com', verified: true }],
        removeExistingUsers: false,
      });
      ({ Sets } = require('../../imports/modules/collection'));
      await Sets.removeAsync({ createdBy: { $in: [user1._id, user2._id] } });
      await Meteor.users.updateAsync(
        { _id: { $in: [user1._id, user2._id] } },
        { $set: { publicSetsCount: 0 } },
        { multi: true },
      );
    });

    it('should update publicSetsCount for each owner in setIds', async () => {
      // user1: 2 sets (1 public, 1 not), user2: 2 sets (both public)
      const set1 = await createSetForUser({
        user: user1,
        publicPatternsCount: 0,
      });
      const set2 = await createSetForUser({
        user: user1,
        publicPatternsCount: 2,
      });
      const set3 = await createSetForUser({
        user: user2,
        publicPatternsCount: 1,
      });
      const set4 = await createSetForUser({
        user: user2,
        publicPatternsCount: 3,
      });
      await utils.updateMultiplePublicSetsCount([set1, set2, set3, set4]);
      const updatedUser1 = await Meteor.users.findOneAsync({ _id: user1._id });
      const updatedUser2 = await Meteor.users.findOneAsync({ _id: user2._id });
      expect(updatedUser1.publicSetsCount).to.equal(1);
      expect(updatedUser2.publicSetsCount).to.equal(2);
    });

    it('should not fail if setIds is empty or null', async () => {
      await utils.updateMultiplePublicSetsCount([]);
      await utils.updateMultiplePublicSetsCount(null);
      // Should not throw, and counts remain unchanged
      const updatedUser1 = await Meteor.users.findOneAsync({ _id: user1._id });
      const updatedUser2 = await Meteor.users.findOneAsync({ _id: user2._id });
      expect(updatedUser1.publicSetsCount).to.equal(0);
      expect(updatedUser2.publicSetsCount).to.equal(0);
    });

    it('should only update owners of provided setIds', async () => {
      // user1: 1 set, user2: 2 sets
      const set1 = await createSetForUser({
        user: user1,
        publicPatternsCount: 2,
      });
      const set2 = await createSetForUser({
        user: user2,
        publicPatternsCount: 1,
      });
      const set3 = await createSetForUser({
        user: user2,
        publicPatternsCount: 0,
      });
      await utils.updateMultiplePublicSetsCount([set2]);
      const updatedUser1 = await Meteor.users.findOneAsync({ _id: user1._id });
      const updatedUser2 = await Meteor.users.findOneAsync({ _id: user2._id });
      expect(updatedUser1.publicSetsCount).to.equal(0);
      expect(updatedUser2.publicSetsCount).to.equal(1);
    });
  });

  describe('validHolesCheck', () => {
    it('should pass check for allowed holes', () => {
      [2, 4, 6].forEach((val) => {
        expect(() => check(val, utils.validHolesCheck)).to.not.throw();
      });
    });
    it('should fail check for disallowed holes', () => {
      [1, 3, 5, 7, 8].forEach((val) => {
        expect(() => check(val, utils.validHolesCheck)).to.throw();
      });
    });
  });

  describe('validRowsCheck', () => {
    it('should pass check for valid row numbers', () => {
      expect(() => check(0, utils.validRowsCheck)).to.not.throw();
      expect(() => check(199, utils.validRowsCheck)).to.not.throw();
    });
    it('should fail check for invalid row numbers', () => {
      expect(() => check(-1, utils.validRowsCheck)).to.throw();
      expect(() => check(200, utils.validRowsCheck)).to.throw();
    });
  });

  describe('validTabletsCheck', () => {
    it('should pass check for valid tablet numbers', () => {
      expect(() => check(0, utils.validTabletsCheck)).to.not.throw();
      expect(() => check(100, utils.validTabletsCheck)).to.not.throw();
    });
    it('should fail check for invalid tablet numbers', () => {
      expect(() => check(-1, utils.validTabletsCheck)).to.throw();
      expect(() => check(101, utils.validTabletsCheck)).to.throw();
    });
  });

  describe('validPatternTypeCheck', () => {
    it('should pass check for allowed pattern types', () => {
      [
        'individual',
        'allTogether',
        'doubleFaced',
        'brokenTwill',
        'freehand',
      ].forEach((val) => {
        expect(() => check(val, utils.validPatternTypeCheck)).to.not.throw();
      });
    });
    it('should fail check for disallowed pattern types', () => {
      ['notAType', '', null, undefined].forEach((val) => {
        expect(() => check(val, utils.validPatternTypeCheck)).to.throw();
      });
    });
  });

  describe('positiveIntegerCheck', () => {
    it('should pass check for positive integer', () => {
      expect(() => check(5, utils.positiveIntegerCheck)).to.not.throw();
    });

    it('should fail check for negative integer', () => {
      expect(() => check(-1, utils.positiveIntegerCheck)).to.throw();
    });
  });

  describe('validPaletteIndexCheck', () => {
    it('should pass check for valid palette indices', () => {
      [0, 5, 15, -1].forEach((val) => {
        expect(() => check(val, utils.validPaletteIndexCheck)).to.not.throw();
      });
    });
    it('should fail check for invalid palette indices', () => {
      [16, 100, -2].forEach((val) => {
        expect(() => check(val, utils.validPaletteIndexCheck)).to.throw();
      });
    });
  });

  describe('validDirectionCheck', () => {
    it('should pass check for allowed directions', () => {
      ['F', 'B'].forEach((val) => {
        expect(() => check(val, utils.validDirectionCheck)).to.not.throw();
      });
    });
    it('should fail check for disallowed directions', () => {
      ['X', '', null, undefined].forEach((val) => {
        expect(() => check(val, utils.validDirectionCheck)).to.throw();
      });
    });
  });

  describe('validTwillChartCheck', () => {
    it('should pass check for allowed twill chart names', () => {
      ['twillPatternChart', 'twillDirectionChangeChart'].forEach((val) => {
        expect(() => check(val, utils.validTwillChartCheck)).to.not.throw();
      });
    });
    it('should fail check for disallowed twill chart names', () => {
      ['notAChart', '', null, undefined].forEach((val) => {
        expect(() => check(val, utils.validTwillChartCheck)).to.throw();
      });
    });
  });

  describe('validHexColorCheck', () => {
    it('should pass check for valid hex colors', () => {
      ['#fff', '#aa00aa', '#123456', '#000', '#a'].forEach((val) => {
        expect(() => check(val, utils.validHexColorCheck)).to.not.throw();
      });
    });
    it('should fail check for invalid hex colors', () => {
      ['', '#1234567', '#12345678', 'notAColor', null, undefined].forEach(
        (val) => {
          expect(() => check(val, utils.validHexColorCheck)).to.throw();
        },
      );
    });
  });

  describe('checkUserCanCreatePattern', () => {
    let originalPatterns;
    let unwrapUser;
    before(async () => {
      await ensureAllRolesExist();
      // Save originals
      originalPatterns = global.Patterns;
      // Import unwrapUser dynamically to avoid circular deps
      ({ unwrapUser } = await import('./mockUser'));
    });

    afterEach(async () => {
      // Restore after each test
      global.Patterns = originalPatterns;
      if (unwrapUser) unwrapUser();
    });

    it('should return error if userId is missing', async () => {
      global.Patterns = { find: () => ({ countAsync: async () => 0 }) };
      const result = await utils.checkUserCanCreatePattern();
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-not-logged-in');
      expect(result.value).to.be.false;
    });

    it('should return error if user is not registered', async () => {
      const user = await stubUser({ roles: [] });
      global.Patterns = { find: () => ({ countAsync: async () => 0 }) };
      const result = await utils.checkUserCanCreatePattern(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-not-registered');
      expect(result.value).to.be.false;
    });

    it('should return error if registered user has reached pattern limit', async () => {
      const user = await stubUser({ roles: ['registered'] });
      await createPatternForUser(user); // 1 pattern
      const result = await utils.checkUserCanCreatePattern(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-too-many-patterns');
      expect(result.value).to.be.false;
    });

    it('should return error if verified user has reached pattern limit', async () => {
      const user = await stubUser({ roles: ['registered', 'verified'] });
      for (let i = 0; i < 100; i++) {
        await createPatternForUser(user);
      }
      const result = await utils.checkUserCanCreatePattern(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-too-many-patterns');
      expect(result.value).to.be.false;
    });

    it('should return value: true if user is registered and under limit', async () => {
      const user = await stubUser({ roles: ['registered'] });
      global.Patterns = { find: () => ({ countAsync: async () => 0 }) };
      const result = await utils.checkUserCanCreatePattern(user._id);
      expect(result.error).to.not.exist;
      expect(result.value).to.be.true;
    });
  });

  // Add more tests for other exported functions as needed

  describe('checkUserCanAddPatternImage', () => {
    let stubUser, unwrapUser, addPatternDataIndividual;
    before(() => {
      ({ stubUser, unwrapUser } = require('./mockUser'));
      ({ addPatternDataIndividual } = require('./testData'));
    });

    afterEach(async () => {
      if (unwrapUser) unwrapUser();
    });

    it('should return error if userId is missing', async () => {
      const result = await utils.checkUserCanAddPatternImage('somePatternId');
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-image-not-logged-in');
      expect(result.value).to.be.false;
    });

    it('should return error if user is not registered', async () => {
      const user = await stubUser({ roles: [] });
      const owner = await stubUser({
        roles: ['registered'],
        username: 'Owner',
      });
      const patternId = await createPatternForUser(owner);
      const result = await utils.checkUserCanAddPatternImage(
        patternId,
        user._id,
      );
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-image-not-logged-in');
      expect(result.value).to.be.false;
    });

    it('should return error if pattern not found', async () => {
      const user = await stubUser({ roles: ['registered'] });
      const result = await utils.checkUserCanAddPatternImage(
        'nonexistentPatternId',
        user._id,
      );
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-image-not-found');
      expect(result.value).to.be.false;
    });

    it('should return error if pattern not created by user', async () => {
      const owner = await stubUser({
        roles: ['registered'],
        username: 'Owner',
      });
      const patternId = await createPatternForUser(owner);
      const otherUser = await stubUser({
        roles: ['registered'],
        username: 'Other',
      });
      const result = await utils.checkUserCanAddPatternImage(
        patternId,
        otherUser._id,
      );
      expect(result.error).to.exist;
      expect(result.error.error).to.equal(
        'add-pattern-image-not-created-by-user',
      );
      expect(result.value).to.be.false;
    });

    it('should return error if registered user tries to add any image', async () => {
      const user = await stubUser({ roles: ['registered'] });
      const patternId = await createPatternForUser(user);
      const result = await utils.checkUserCanAddPatternImage(
        patternId,
        user._id,
      );
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-image-too-many-images');
      expect(result.value).to.be.false;
    });

    it('should return error if verified user has reached image limit', async () => {
      const user = await stubUser({ roles: ['registered', 'verified'] });
      const patternId = await createPatternForUser(user);
      for (let i = 0; i < 5; i++) {
        await insertPatternImage({
          patternId,
          user,
          key: `test-key-${i}`,
          url: `http://example.com/test${i}.jpg`,
        });
      }
      const result = await utils.checkUserCanAddPatternImage(
        patternId,
        user._id,
      );
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-image-too-many-images');
      expect(result.value).to.be.false;
    });

    it('should return value: true if verified user can add image (under limit)', async () => {
      const user = await stubUser({ roles: ['registered', 'verified'] });
      const patternId = await createPatternForUser(user);
      for (let i = 0; i < 4; i++) {
        await insertPatternImage({
          patternId,
          user,
          key: `test-key-${i}`,
          url: `http://example.com/test${i}.jpg`,
        });
      }
      const result = await utils.checkUserCanAddPatternImage(
        patternId,
        user._id,
      );
      expect(result.error).to.not.exist;
      expect(result.value).to.be.true;
    });
  });

  describe('checkCanCreateColorBook', () => {
    let stubUser, unwrapUser;
    before(() => {
      ({ stubUser, unwrapUser } = require('./mockUser'));
    });

    afterEach(async () => {
      if (unwrapUser) unwrapUser();
    });

    it('should return error if userId is missing', async () => {
      const result = await utils.checkCanCreateColorBook();
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-color-book-not-logged-in');
      expect(result.value).to.be.false;
    });

    it('should return error if user is not registered', async () => {
      const user = await stubUser({ roles: [] });
      const result = await utils.checkCanCreateColorBook(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-color-book-not-registered');
      expect(result.value).to.be.false;
    });

    it('should return error if registered user has reached color book limit', async () => {
      const user = await stubUser({ roles: ['registered'] });
      await insertColorBook({
        user,
        name: 'Book 1',
        nameSort: 'book 1',
        colors: ['#fff'],
        isPublic: false,
      });
      const result = await utils.checkCanCreateColorBook(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal(
        'add-color-book-too-many-color-books',
      );
      expect(result.value).to.be.false;
    });

    it('should return value: true if registered user is under color book limit', async () => {
      const user = await stubUser({ roles: ['registered'] });
      const { ColorBooks } = require('../../imports/modules/collection');
      await ColorBooks.removeAsync({ createdBy: user._id });
      const result = await utils.checkCanCreateColorBook(user._id);
      expect(result.error).to.not.exist;
      expect(result.value).to.be.true;
    });

    it('should return error if verified user has reached color book limit', async () => {
      const user = await stubUser({ roles: ['registered', 'verified'] });
      for (let i = 0; i < 5; i++) {
        await insertColorBook({
          user,
          name: `Book ${i}`,
          nameSort: `book ${i}`,
          colors: ['#fff'],
          isPublic: false,
        });
      }
      const result = await utils.checkCanCreateColorBook(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal(
        'add-color-book-too-many-color-books',
      );
      expect(result.value).to.be.false;
    });

    it('should return value: true if verified user is under color book limit', async () => {
      const user = await stubUser({ roles: ['registered', 'verified'] });
      const { ColorBooks } = require('../../imports/modules/collection');
      await ColorBooks.removeAsync({ createdBy: user._id });
      for (let i = 0; i < 4; i++) {
        await insertColorBook({
          user,
          name: `Book ${i}`,
          nameSort: `book ${i}`,
          colors: ['#fff'],
          isPublic: false,
        });
      }
      const result = await utils.checkCanCreateColorBook(user._id);
      expect(result.error).to.not.exist;
      expect(result.value).to.be.true;
    });
  });

  describe('updatePublicPatternsCountForUser', () => {
    let user;
    beforeEach(async () => {
      await ensureAllRolesExist();
      user = await stubUser({ roles: ['registered', 'verified'] });
      // Clean up any patterns for this user
      const { Patterns } = require('../../imports/modules/collection');
      await Patterns.removeAsync({ createdBy: user._id });
      await Meteor.users.updateAsync(
        { _id: user._id },
        { $set: { publicPatternsCount: 0 } },
      );
    });

    it('should set publicPatternsCount to 0 if user has no public patterns', async () => {
      await utils.updatePublicPatternsCountForUser(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicPatternsCount).to.equal(0);
    });

    it('should count only public patterns for the user', async () => {
      // Add 2 private and 3 public patterns using the helper and set isPublic via pattern.edit
      const patternIds = [];
      for (let i = 0; i < 2; i++) {
        patternIds.push(await createPatternForUser(user));
      }
      for (let i = 0; i < 3; i++) {
        const patternId = await createPatternForUser(user);
        await Meteor.callAsync('pattern.edit', {
          _id: patternId,
          data: { type: 'editIsPublic', isPublic: true },
        });
        patternIds.push(patternId);
      }
      await utils.updatePublicPatternsCountForUser(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicPatternsCount).to.equal(3);
    });

    it('should not count public patterns created by other users', async () => {
      // Add 2 public patterns for another user using the helper and set isPublic via pattern.edit
      const otherUser = await stubUser({
        roles: ['registered', 'verified'],
        removeExistingUsers: false, // keep existing user for this test
        username: 'OtherUser', // ensure different username etc
        emails: [
          {
            address: 'otheruser@here.com',
            verified: true,
          },
        ],
      });
      for (let i = 0; i < 2; i++) {
        const patternId = await createPatternForUser(otherUser);
        await Meteor.callAsync('pattern.edit', {
          _id: patternId,
          data: { type: 'editIsPublic', isPublic: true },
        });
      }

      await utils.updatePublicPatternsCountForUser(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicPatternsCount).to.equal(0);
    });
  });

  describe('updatePublicPatternsCountForSet', () => {
    let user;
    let Patterns, Sets;
    beforeEach(async () => {
      await ensureAllRolesExist();
      user = await stubUser({ roles: ['registered', 'verified'] });
      ({ Patterns, Sets } = require('../../imports/modules/collection'));
      await Patterns.removeAsync({ createdBy: user._id });
      await Sets.removeAsync({ createdBy: user._id });
    });

    it('should set publicPatternsCount to 0 if all patterns are private', async () => {
      // Create 3 private patterns
      const patternIds = [];
      for (let i = 0; i < 3; i++) {
        patternIds.push(await createPatternForUser(user));
      }
      // Create a set with these patterns using helper
      const setId = await createSetForUser({
        user,
        patterns: patternIds,
        name: 'Test Set',
        nameSort: 'test set',
        tags: [],
      });
      await utils.updatePublicPatternsCountForSet(setId);
      const updatedSet = await Sets.findOneAsync({ _id: setId });
      expect(updatedSet.publicPatternsCount).to.equal(0);
    });

    it('should count only public patterns in the set', async () => {
      // Create 2 private and 2 public patterns
      const patternIds = [];
      for (let i = 0; i < 2; i++) {
        patternIds.push(await createPatternForUser(user));
      }
      for (let i = 0; i < 2; i++) {
        const patternId = await createPatternForUser(user);
        await Meteor.callAsync('pattern.edit', {
          _id: patternId,
          data: { type: 'editIsPublic', isPublic: true },
        });
        patternIds.push(patternId);
      }
      // Create a set with these patterns using helper
      const setId = await createSetForUser({
        user,
        patterns: patternIds,
      });
      await utils.updatePublicPatternsCountForSet(setId);
      const updatedSet = await Sets.findOneAsync({ _id: setId });
      expect(updatedSet.publicPatternsCount).to.equal(2);
    });

    it('should count all patterns if all are public', async () => {
      // Create 3 public patterns
      const patternIds = [];
      for (let i = 0; i < 3; i++) {
        const patternId = await createPatternForUser(user);
        await Meteor.callAsync('pattern.edit', {
          _id: patternId,
          data: { type: 'editIsPublic', isPublic: true },
        });
        patternIds.push(patternId);
      }
      // Create a set with these patterns using helper
      const setId = await createSetForUser({
        user,
        patterns: patternIds,
      });
      await utils.updatePublicPatternsCountForSet(setId);
      const updatedSet = await Sets.findOneAsync({ _id: setId });
      expect(updatedSet.publicPatternsCount).to.equal(3);
    });

    it('should not count public patterns not in the set', async () => {
      // Create 2 patterns for the set, 1 public pattern not in the set
      const patternIds = [];
      for (let i = 0; i < 2; i++) {
        patternIds.push(await createPatternForUser(user));
      }
      const notInSetId = await createPatternForUser(user);
      await Meteor.callAsync('pattern.edit', {
        _id: notInSetId,
        data: { type: 'editIsPublic', isPublic: true },
      });
      // Create a set with only the first 2 patterns using helper
      const setId = await createSetForUser({
        user,
        patterns: patternIds,
      });
      await utils.updatePublicPatternsCountForSet(setId);
      const updatedSet = await Sets.findOneAsync({ _id: setId });
      expect(updatedSet.publicPatternsCount).to.equal(0);
    });
  });

  describe('updatePublicColorBooksCount', () => {
    let user;
    beforeEach(async () => {
      await ensureAllRolesExist();
      user = await stubUser({ roles: ['registered', 'verified'] });
      await ColorBooks.removeAsync({ createdBy: user._id });
      await Meteor.users.updateAsync(
        { _id: user._id },
        { $set: { publicColorBooksCount: 0 } },
      );
    });

    it('should set publicColorBooksCount to 0 if user has no public color books', async () => {
      await utils.updatePublicColorBooksCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicColorBooksCount).to.equal(0);
    });

    it('should count only public color books for the user', async () => {
      // Add 2 private and 3 public color books
      for (let i = 0; i < 2; i++) {
        await insertColorBookForUser({ user });
      }
      for (let i = 0; i < 3; i++) {
        await insertColorBookForUser({ user, isPublic: true });
      }
      await utils.updatePublicColorBooksCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicColorBooksCount).to.equal(3);
    });

    it('should not count public color books created by other users', async () => {
      // Add 2 public color books for another user
      const otherUser = await stubUser({
        roles: ['registered', 'verified'],
        removeExistingUsers: false,
        username: 'OtherUser',
        emails: [{ address: 'otheruser@here.com', verified: true }],
      });
      for (let i = 0; i < 2; i++) {
        await insertColorBookForUser({ user: otherUser, isPublic: true });
      }
      await utils.updatePublicColorBooksCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicColorBooksCount).to.equal(0);
    });

    it('should count all if all are public', async () => {
      for (let i = 0; i < 4; i++) {
        await insertColorBookForUser({ user, isPublic: true });
      }
      await utils.updatePublicColorBooksCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicColorBooksCount).to.equal(4);
    });
  });

  describe('updatePublicSetsCount', () => {
    let user;
    let Sets;
    beforeEach(async () => {
      await ensureAllRolesExist();
      user = await stubUser({ roles: ['registered', 'verified'] });
      ({ Sets } = require('../../imports/modules/collection'));
      await Sets.removeAsync({ createdBy: user._id });
      await Meteor.users.updateAsync(
        { _id: user._id },
        { $set: { publicSetsCount: 0 } },
      );
    });

    it('should set publicSetsCount to 0 if user has no sets with public patterns', async () => {
      // Create 2 sets, both with publicPatternsCount 0
      for (let i = 0; i < 2; i++) {
        await createSetForUser({ user, publicPatternsCount: 0 });
      }
      await utils.updatePublicSetsCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicSetsCount).to.equal(0);
    });

    it('should count only sets with publicPatternsCount > 0', async () => {
      // 2 sets with publicPatternsCount 0, 3 sets with publicPatternsCount > 0
      for (let i = 0; i < 2; i++) {
        await createSetForUser({ user, publicPatternsCount: 0 });
      }
      for (let i = 0; i < 3; i++) {
        await createSetForUser({ user, publicPatternsCount: i + 1 });
      }
      await utils.updatePublicSetsCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicSetsCount).to.equal(3);
    });

    it('should not count sets created by other users', async () => {
      const otherUser = await stubUser({
        roles: ['registered', 'verified'],
        removeExistingUsers: false,
        username: 'OtherUser',
        emails: [{ address: 'otheruser@here.com', verified: true }],
      });
      for (let i = 0; i < 2; i++) {
        await createSetForUser({ user: otherUser, publicPatternsCount: 2 });
      }
      await utils.updatePublicSetsCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicSetsCount).to.equal(0);
    });

    it('should count all sets if all have publicPatternsCount > 0', async () => {
      for (let i = 0; i < 4; i++) {
        await createSetForUser({ user, publicPatternsCount: 2 });
      }
      await utils.updatePublicSetsCount(user._id);
      const updatedUser = await Meteor.users.findOneAsync({ _id: user._id });
      expect(updatedUser.publicSetsCount).to.equal(4);
    });
  });

  describe('getPatternFilter', () => {
    it('should return default selector with no filters', () => {
      const selector = utils.getPatternFilter({});
      expect(selector).to.deep.equal({
        $and: [
          { numberOfTablets: { $gte: 1 } },
          { numberOfTablets: { $lte: 100 } },
        ],
      });
    });

    it('should apply min and max tablets', () => {
      const selector = utils.getPatternFilter({
        filterMinTablets: 5,
        filterMaxTablets: 10,
      });
      expect(selector).to.deep.equal({
        $and: [
          { numberOfTablets: { $gte: 5 } },
          { numberOfTablets: { $lte: 10 } },
        ],
      });
    });

    it('should clamp min and max tablets to allowed range', () => {
      const selector = utils.getPatternFilter({
        filterMinTablets: 0,
        filterMaxTablets: 200,
      });
      expect(selector).to.deep.equal({
        $and: [
          { numberOfTablets: { $gte: 1 } },
          { numberOfTablets: { $lte: 100 } },
        ],
      });
    });

    it('should add isTwistNeutral and willRepeat filters', () => {
      const selector = utils.getPatternFilter({
        filterIsTwistNeutral: true,
        filterWillRepeat: true,
      });
      expect(selector).to.deep.equal({
        $and: [
          { numberOfTablets: { $gte: 1 } },
          { numberOfTablets: { $lte: 100 } },
          { isTwistNeutral: true },
          { willRepeat: true },
        ],
      });
    });
  });

  describe('setupOrientations', () => {
    it('should return all DEFAULT_ORIENTATION if no templateTypeDef or doubleFaced', () => {
      // Use the real DEFAULT_ORIENTATION value from parameters
      const tablets = 4;
      const result = utils.setupOrientations({ tablets });
      // Explicit expected array using the real value
      const expected = Array(tablets).fill(DEFAULT_ORIENTATION);
      expect(result).to.deep.equal(expected);
    });

    it('should use templateTypeDef.orientations cyclically (real values)', () => {
      // Use a real orientation array from DOUBLE_FACED_ORIENTATIONS
      // (not A/B, but e.g. ['/', '\'])
      const realOrientations = DOUBLE_FACED_ORIENTATIONS[0].name.split('');
      // For example, if name is '/\', realOrientations = ['/', '\']
      const templateTypeDef = { orientations: realOrientations };
      const tablets = 5;
      const result = utils.setupOrientations({ tablets, templateTypeDef });
      // Explicit expected array, cycling realOrientations
      const expected = [
        realOrientations[0],
        realOrientations[1],
        realOrientations[0],
        realOrientations[1],
        realOrientations[0],
      ];
      expect(result).to.deep.equal(expected);
    });

    it('should use alternating / \\ for 12 tablets', () => {
      const orientationStr = '/\\';
      const tablets = 12;
      const result = utils.setupOrientations({
        patternType: 'doubleFaced',
        tablets,
        doubleFacedOrientations: orientationStr,
      });
      const expected = [
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
      ];
      expect(result).to.deep.equal(expected);
    });

    it('should use alternating \\ / for 12 tablets', () => {
      const orientationStr = '\\/';
      const tablets = 12;
      const result = utils.setupOrientations({
        patternType: 'doubleFaced',
        tablets,
        doubleFacedOrientations: orientationStr,
      });
      const expected = [
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
        '\\',
        '/',
      ];
      expect(result).to.deep.equal(expected);
    });

    it('should use all / for 12 tablets', () => {
      const orientationStr = '//';
      const tablets = 12;
      const result = utils.setupOrientations({
        patternType: 'doubleFaced',
        tablets,
        doubleFacedOrientations: orientationStr,
      });
      const expected = Array(12).fill('/');
      expect(result).to.deep.equal(expected);
    });

    it('should use all \\ for 12 tablets', () => {
      const orientationStr = '\\\\';
      const tablets = 12;
      const result = utils.setupOrientations({
        patternType: 'doubleFaced',
        tablets,
        doubleFacedOrientations: orientationStr,
      });
      const expected = Array(12).fill('\\');
      expect(result).to.deep.equal(expected);
    });
  });

  describe('setupDoubleFacedThreading', () => {
    it('should generate the explicit expected double-faced threading for 8 tablets with 4 holes', () => {
      const result = utils.setupDoubleFacedThreading({
        holes: 4,
        numberOfTablets: 8,
      });
      expect(result).to.deep.equal(expectedDoubleFacedThreading);
    });
  });

  describe('setupTwillThreading', () => {
    it('should generate the explicit expected twill threading for 4 holes and 8 tablets', () => {
      const result = utils.setupTwillThreading({
        holes: 4,
        numberOfTablets: 8,
        startTablet: 0,
      });
      expect(result).to.deep.equal(expectedTwillThreading);
    });
  });

  describe('buildServerLogText', () => {
    it('should return a correctly formatted log string in test mode', async () => {
      // Freeze time to a known value
      const clock = sinon.useFakeTimers(
        new Date('2025-12-23T12:34:56Z').getTime(),
      );

      const text = 'Test log entry';
      const result = await utils.buildServerLogText(text);
      expect(result).to.equal(
        '2025/12/23 12:34:56 Test log entry, client: local.testing, host: "local.testing"',
      );

      clock.restore();
    });
  });

  describe('asyncForEach', () => {
    it('calls the callback for each element in order', async () => {
      const arr = [1, 2, 3];
      const result = [];
      await utils.asyncForEach(arr, async (x) => {
        result.push(x);
      });
      expect(result).to.deep.equal([1, 2, 3]);
    });

    it('awaits each callback sequentially', async () => {
      const arr = [1, 2, 3];
      const result = [];
      await utils.asyncForEach(arr, async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        result.push(x);
      });
      expect(result).to.deep.equal([1, 2, 3]);
    });

    it('propagates errors from the callback', async () => {
      const arr = [1, 2, 3];
      let callCount = 0;
      try {
        await utils.asyncForEach(arr, async (x) => {
          callCount += 1;
          if (x === 2) throw new Error('fail');
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('fail');
        expect(callCount).to.equal(2); // stops at first error
      }
    });

    it('handles empty array without error', async () => {
      let called = false;
      await utils.asyncForEach([], async () => {
        called = true;
      });
      expect(called).to.be.false;
    });
  });
});
