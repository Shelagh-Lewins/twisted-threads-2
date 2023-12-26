/* eslint-env mocha */
// test for pattern preview methods
// we only check permissions because the image would come from the client

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { expect } from 'chai';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/patternPreview';
import { stubNoUser, stubOtherUser, stubUser, unwrapUser } from './mockUser';
import { addPatternDataIndividual } from './testData';

if (Meteor.isServer) {
  describe('test methods for pattern previews', function () {
    // eslint-disable-line func-names
    this.timeout(15000);
    beforeEach(() => {
      resetDatabase();
      stubUser();
      this.patternId = Meteor.call('pattern.add', {
        ...{ createdBy: Meteor.userId() },
        ...addPatternDataIndividual,
      });
    });
    afterEach(() => {
      resetDatabase();
      unwrapUser();
    });
    describe('patternPreview.save method', () => {
      it('cannot save pattern preview if not logged in', () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'save-preview-not-logged-in',
        );
      });
      it('cannot save pattern preview if pattern not found', () => {
        function expectedError() {
          Meteor.call('patternPreview.save', {
            _id: 'abc',
            uri: 'a_uri',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'save-preview-not-found',
        );
      });
      it('cannot save pattern preview if pattern created by another user', () => {
        stubOtherUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'save-preview-not-created-by-user',
        );
      });
      it('can save pattern preview if user has serviceUser role', () => {
        stubOtherUser();

        // give user serviceUser role
        Roles.createRole('serviceUser', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['serviceUser']);

        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'save-preview-error', // expect an error as we don't actually want to save to S3 in the test!
          's3.upload',
        );
      });
      it('cannot save pattern preview if image invalid', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'save-preview-error',
          'image size',
        );
      });
    });
    describe('patternPreview.remove method', () => {
      it('cannot remove pattern preview if not logged in', () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('patternPreview.remove', {
            _id: patternId,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-pattern-preview-not-logged-in',
        );
      });
      it('cannot remove pattern preview if pattern not found', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('patternPreview.remove', {
            _id: patternId,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-pattern-preview-not-found',
        );
      });
      it('cannot remove pattern preview if pattern created by another user', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const patternPreview = Factory.create('patternPreview', {
          patternId,
          uri: 'something',
          createdBy: Meteor.userId(),
        });

        stubOtherUser();

        function expectedError() {
          Meteor.call('patternPreview.remove', {
            _id: patternPreview._id,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-pattern-preview-not-created-by-user',
        );
      });
      it('cannot remove pattern preview if user has serviceUser role', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const patternPreview = Factory.create('patternPreview', {
          patternId,
          uri: 'something',
          createdBy: Meteor.userId(),
        });

        stubOtherUser();

        // give user serviceUser role
        Roles.createRole('serviceUser', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['serviceUser']);

        function expectedError() {
          Meteor.call('patternPreview.remove', {
            _id: patternPreview._id,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-pattern-preview-not-created-by-user',
        );
      });
    });
  });
}
