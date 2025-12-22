/* eslint-env mocha */
import { expect } from 'chai';
import { check } from 'meteor/check';
import * as utils from '../../imports/server/modules/utils';
import { ensureAllRolesExist } from './00_setup';
import {
  createPatternForUser,
  insertPatternImage,
  insertColorBook,
} from './testHelpers';
import { stubUser } from './mockUser';

describe('utils.js basic unit tests', () => {
  describe('nonEmptyStringCheck', () => {
    it('should pass check for non-empty string', () => {
      expect(() => check('abc', utils.nonEmptyStringCheck)).to.not.throw();
    });

    it('should fail check for empty string', () => {
      expect(() => check('', utils.nonEmptyStringCheck)).to.throw();
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
    let stubUser, unwrapUser;
    before(async () => {
      await ensureAllRolesExist();
      // Save originals
      originalPatterns = global.Patterns;
      // Import stubUser and unwrapUser dynamically to avoid circular deps
      ({ stubUser, unwrapUser } = require('./mockUser'));
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
});
