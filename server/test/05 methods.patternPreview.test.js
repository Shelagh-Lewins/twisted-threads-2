/* eslint-env mocha */
// test for pattern preview methods
// we only check permissions because the image would come from the client

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { expect } from 'chai';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/patternPreview';
import {
	stubNoUser,
	stubOtherUser,
	stubUser,
	unwrapUser,
} from './mockUser';
import {
	addPatternDataIndividual,
} from './testData';

if (Meteor.isServer) {
	describe('test methods for pattern previews', function () { // eslint-disable-line func-names
		this.timeout(15000);
		beforeEach(() => {
			resetDatabase();
			stubUser();
			this.patternId = Meteor.call('pattern.add', addPatternDataIndividual);
		});
		afterEach(() => {
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
						'_id': patternId,
						'uri': 'a_uri',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'save-preview-not-logged-in');
			});
			it('cannot save pattern preview if pattern not found', () => {
				function expectedError() {
					Meteor.call('patternPreview.save', {
						'_id': 'abc',
						'uri': 'a_uri',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'save-preview-not-found');
			});
			it('cannot save pattern preview if pattern created by another user', () => {
				stubOtherUser();
				const { patternId } = this; // seems to be a scoping issue otherwise

				function expectedError() {
					Meteor.call('patternPreview.save', {
						'_id': patternId,
						'uri': 'a_uri',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'save-preview-not-created-by-user');
			});
			it('cannot save pattern preview if image invalid', () => {
				const { patternId } = this; // seems to be a scoping issue otherwise

				function expectedError() {
					Meteor.call('patternPreview.save', {
						'_id': patternId,
						'uri': 'a_uri',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'image error');
			});
		});
	});
}
