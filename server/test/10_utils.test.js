/* eslint-env mocha */
import { expect } from 'chai';
import { check } from 'meteor/check';
import * as utils from '../../imports/server/modules/utils';

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

  // Add more tests for other exported functions as needed
});
