import { expect } from 'chai';
import tagsSchema from '../imports/modules/schemas/tagsSchema';
import patternsSchema from '../imports/modules/schemas/patternsSchema';
import setsSchema from '../imports/modules/schemas/setsSchema';

describe('schemas import', function () {
  it('imports tags schema without throwing', function () {
    expect(() =>
      require('../imports/modules/schemas/tagsSchema'),
    ).to.not.throw();
  });

  it('imports patterns schema without throwing', function () {
    expect(() =>
      require('../imports/modules/schemas/patternsSchema'),
    ).to.not.throw();
  });

  it('imports sets schema without throwing', function () {
    expect(() =>
      require('../imports/modules/schemas/setsSchema'),
    ).to.not.throw();
  });

  it('tags schema exports an object', function () {
    expect(tagsSchema).to.be.an('object');
  });

  it('patterns schema exports an object', function () {
    expect(patternsSchema).to.be.an('object');
  });

  it('sets schema exports an object', function () {
    expect(setsSchema).to.be.an('object');
  });

  // Check for a key field in each schema
  it('patterns schema has a "name" field', function () {
    expect(patternsSchema.schema()).to.have.property('name');
  });

  it('sets schema has a "name" field', function () {
    expect(setsSchema.schema()).to.have.property('name');
  });

  it('tags schema has a "name" field', function () {
    expect(tagsSchema.schema()).to.have.property('name');
  });
});
