/* eslint-env mocha */
// test for tags methods

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import { Patterns, Tags } from '../../imports/modules/collection';
import '../methods/tags';
import { stubNoUser, stubOtherUser, stubUser, unwrapUser } from './mockUser';
import {
  MAX_TAG_LENGTH,
  MIN_TAG_LENGTH,
} from '../../imports/modules/parameters';
import { addPatternDataIndividual } from './testData';

if (Meteor.isServer) {
  describe('test methods for tags', function testTagMethods() {
    // eslint-disable-line func-names
    this.timeout(15000);
    beforeEach(() => {
      resetDatabase();
      stubUser();
      this.patternId = Meteor.call('pattern.add', addPatternDataIndividual);
    });
    afterEach(() => {
      unwrapUser();
    });
    describe('tags.add method', () => {
      // create a tag and assign it to a pattern
      it('cannot add tag to pattern if not logged in', () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: 'easy',
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'add-tag-not-logged-in');
      });
      it('cannot add tag to pattern if pattern not found', () => {
        function expectedError() {
          Meteor.call('tags.add', {
            targetId: 'abc',
            targetType: 'pattern',
            name: 'easy',
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'add-tag-not-found');
      });
      it('cannot add tag to pattern if pattern created by another user', () => {
        stubOtherUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: 'easy',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-tag-not-created-by-user',
        );
      });
      it('cannot add tag to pattern if the tag already exists', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise
        await Tags.insertAsync({ name: 'easy' });

        function expectedError() {
          Meteor.call('tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: 'easy',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-tag-already-exists',
        );
      });
      it('cannot add tag to pattern if the tag name is too short', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        let tagText = '';

        for (let i = 0; i < MIN_TAG_LENGTH - 1; i += 1) {
          tagText += 'a';
        }

        function expectedError() {
          Meteor.call('tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'add-tag-too-short');
      });
      it('cannot add tag to pattern if the tag name is too long', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        let tagText = '';

        for (let i = 0; i < MAX_TAG_LENGTH + 1; i += 1) {
          tagText += 'a';
        }

        function expectedError() {
          Meteor.call('tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'add-tag-too-long');
      });
      it('can add tag to pattern', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        Meteor.call('tags.add', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        const newTag = Tags.findOne({ name: tagText });

        // the tag has been created
        assert.equal(newTag.name, tagText);

        // the tag has been assigned to the pattern
        const updatedPattern = Patterns.findOne({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
      it('converts the tag text to lowercase', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'EaSy';
        const processedTagText = tagText.toLowerCase();

        Meteor.call('tags.add', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        const newTag = Tags.findOne({ name: processedTagText });

        // the tag has been created
        assert.equal(newTag.name, processedTagText);

        // the tag has been assigned to the pattern
        const updatedPattern = Patterns.findOne({ _id: patternId });

        assert.notEqual(updatedPattern.tags.indexOf(processedTagText), -1);
      });
    });
    describe('tags.assignToDocument method', () => {
      // assign an existing tag to a pattern
      it('cannot assign tag to pattern if not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';
        Tags.insertAsync({ name: tagText });

        function expectedError() {
          Meteor.call('tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'assign-tag-not-logged-in',
        );
      });
      it('cannot assign tag to pattern if pattern not found', async () => {
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });

        function expectedError() {
          Meteor.call('tags.assignToDocument', {
            targetId: 'abc',
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'assign-tag-not-found');
      });
      it('cannot assign tag to pattern if pattern created by another user', async () => {
        stubOtherUser();

        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });

        const { patternId } = this; // seems to be a scoping issue otherwise

        function expectedError() {
          Meteor.call('tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'assign-tag-not-created-by-user',
        );
      });
      it("cannot assign tag to pattern if the tag doesn't exist", () => {
        const { patternId } = this; // seems to be a scoping issue otherwise
        const tagText = 'easy';

        function expectedError() {
          Meteor.call('tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'assign-tag-not-found');
      });
      it('cannot assign tag to pattern if tag already assigned to pattern', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });

        await Patterns.updateAsync(
          { _id: patternId },
          { $push: { tags: tagText } },
        );

        function expectedError() {
          Meteor.call('tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'assign-tag-already-assigned',
        );
      });
      it('can assign tag to pattern', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });

        Meteor.call('tags.assignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        const tag = Tags.findOne({ name: tagText });

        // the tag exists
        assert.equal(tag.name, tagText);

        // the tag has been assigned to the pattern
        const updatedPattern = Patterns.findOne({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
    });
    describe('tags.ensureExistsAndAssignToDocument method', () => {
      // create a tag if it doesn't exist and assign it to a pattern
      // this calls tags.assignToDocument so we don't need to recheck permissions
      it('can ensureExistsAndAssignToDocument with existing tag', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });

        Meteor.call('tags.ensureExistsAndAssignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        // the tag exists
        const tag = Tags.findOne({ name: tagText });
        assert.equal(tag.name, tagText);

        // the tag has been assigned to the pattern
        const updatedPattern = Patterns.findOne({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
      it('can ensureExistsAndAssignToDocument with new tag', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        Meteor.call('tags.ensureExistsAndAssignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        // the tag exists
        const tag = Tags.findOne({ name: tagText });
        assert.equal(tag.name, tagText);

        // the tag has been assigned to the pattern
        const updatedPattern = Patterns.findOne({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
    });
    describe('tags.removeFromDocument method', () => {
      it('cannot remove tag if not logged in', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        Meteor.call('tags.ensureExistsAndAssignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        unwrapUser();
        stubNoUser();

        function expectedError() {
          Meteor.call('tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-tag-not-logged-in',
        );
      });
      it('cannot remove tag if pattern not found', () => {
        const patternId = 'abc'; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        function expectedError() {
          Meteor.call('tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'remove-tag-not-found');
      });
      it('cannot remove tag if pattern created by another user', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        Meteor.call('tags.ensureExistsAndAssignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        stubOtherUser();

        function expectedError() {
          Meteor.call('tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-tag-not-created-by-user',
        );
      });
      it('cannot remove tag if tag not assigned to the pattern', () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        function expectedError() {
          Meteor.call('tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-tag-not-assigned',
        );
      });
      it('can remove the tag', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const tagText = 'easy';

        await Meteor.callAsync('tags.ensureExistsAndAssignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        await Meteor.callAsync('tags.removeFromDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });

        // the tag has been removed from the pattern
        // effectively testing tags.removeUnused
        const updatedPattern = Patterns.findOne({ _id: patternId });
        const { tags } = updatedPattern;
        const index = tags.indexOf(tagText);

        assert.equal(index, -1);

        // the tag no longer exists
        const tag = Tags.findOne({ name: tagText });
        assert.equal(tag, undefined);
      });
    });
  });
}
