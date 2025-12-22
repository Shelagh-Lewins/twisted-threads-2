/* eslint-env mocha */
import { expect } from 'chai';
import { check } from 'meteor/check';
import * as utils from '../../imports/server/modules/utils';
import { ensureAllRolesExist } from './00_setup';

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
      // Create a user with no roles
      const user = await stubUser({ roles: [] });
      global.Patterns = { find: () => ({ countAsync: async () => 0 }) };
      const result = await utils.checkUserCanCreatePattern(user._id);
      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-not-registered');
      expect(result.value).to.be.false;
    });

    it('should return error if registered user has reached pattern limit', async () => {
      const user = await stubUser({ roles: ['registered'] });
      // Add 1 pattern using the real Meteor method
      const { addPatternDataIndividual } = require('./testData');
      for (let i = 0; i < 1; i++) {
        await require('./mockUser').callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
      }
      const result = await utils.checkUserCanCreatePattern(user._id);

      expect(result.error).to.exist;
      expect(result.error.error).to.equal('add-pattern-too-many-patterns');
      expect(result.value).to.be.false;
    });

    it('should return error if verified user has reached pattern limit', async () => {
      const user = await stubUser({ roles: ['registered', 'verified'] });
      const { addPatternDataIndividual } = require('./testData');
      for (let i = 0; i < 100; i++) {
        await require('./mockUser').callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
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
});
