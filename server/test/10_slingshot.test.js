/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';

if (Meteor.isServer) {
  describe('Slingshot directive', function () {
    it('does not throw when AWS env vars are absent and does not call createDirective', function () {
      const origEnv = { ...process.env };
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      delete process.env.AWS_BUCKET;

      const origSlingshot = global.Slingshot;
      global.Slingshot = {
        fileRestrictions: sinon.spy(),
        createDirective: sinon.spy(),
        S3Storage: {},
      };

      // clear module cache and require
      delete require.cache[require.resolve('../../imports/server/modules/slingshot')];
      expect(() => require('../../imports/server/modules/slingshot')).to.not.throw();

      // createDirective should not have been called
      expect(global.Slingshot.createDirective.called).to.be.false;

      // cleanup
      global.Slingshot = origSlingshot;
      process.env = origEnv;
      delete require.cache[require.resolve('../../imports/server/modules/slingshot')];
    });

    it('calls createDirective when AWS env vars are present', function () {
      const origEnv = { ...process.env };
      process.env.AWS_ACCESS_KEY_ID = 'x';
      process.env.AWS_SECRET_ACCESS_KEY = 'y';
      process.env.AWS_BUCKET = 'z';
      process.env.AWSRegion = 'us-east-1';

      const origSlingshot = global.Slingshot;
      global.Slingshot = {
        fileRestrictions: sinon.spy(),
        createDirective: sinon.spy(),
        S3Storage: {},
      };

      delete require.cache[require.resolve('../../imports/server/modules/slingshot')];
      expect(() => require('../../imports/server/modules/slingshot')).to.not.throw();

      expect(global.Slingshot.createDirective.calledOnce).to.be.true;
      const args = global.Slingshot.createDirective.getCall(0).args;
      expect(args[0]).to.equal('myImageUploads');
      expect(args[2]).to.be.an('object');
      expect(args[2].AWSAccessKeyId).to.equal('x');

      // cleanup
      global.Slingshot = origSlingshot;
      process.env = origEnv;
      delete require.cache[require.resolve('../../imports/server/modules/slingshot')];
    });
  });
}
