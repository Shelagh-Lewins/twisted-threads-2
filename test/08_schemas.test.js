import { expect } from 'chai';

describe('Schemas import', function () {
  it('imports tags schema without throwing', function () {
    expect(() => require('../imports/modules/schemas/tagsSchema')).to.not.throw();
  });

  it('imports patterns schema without throwing', function () {
    expect(() => require('../imports/modules/schemas/patternsSchema')).to.not.throw();
  });

  it('imports sets schema without throwing', function () {
    expect(() => require('../imports/modules/schemas/setsSchema')).to.not.throw();
  });
});
