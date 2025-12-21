// --- SETS TAGS TESTS ---
describe('tags on sets', () => {
  let setId;
  beforeEach(async function () {
    await ensureAllRolesExist();
    // Always create a fresh set for each test, except for not-logged-in test
    if (
      this.currentTest &&
      this.currentTest.title !== 'cannot add tag to set if not logged in'
    ) {
      const user = await stubUser();
      const patternId = await callMethodWithUser(
        user._id,
        'pattern.add',
        addPatternDataIndividual,
      );
      setId = await callMethodWithUser(user._id, 'set.add', {
        patternId,
        name: 'Test Set',
      });
      this.setUser = user;
    }
  });

  it('cannot add tag to set if not logged in', async () => {
    const user = await stubUser();
    const patternId = await callMethodWithUser(
      user._id,
      'pattern.add',
      addPatternDataIndividual,
    );
    const setIdLocal = await callMethodWithUser(user._id, 'set.add', {
      patternId,
      name: 'Test Set',
    });
    await unwrapUser();
    await stubNoUser();
    const expectedError = async () => {
      await Meteor.callAsync('tags.add', {
        targetId: setIdLocal,
        targetType: 'set',
        name: 'easy',
      });
    };
    await expect(expectedError()).to.be.rejectedWith('add-tag-not-logged-in');
  });

  it('cannot add tag to set if set not found', async () => {
    const user = await stubUser();
    const expectedError = async () => {
      await callMethodWithUser(user._id, 'tags.add', {
        targetId: 'nonexistentsetid',
        targetType: 'set',
        name: 'easy',
      });
    };
    await expect(expectedError()).to.be.rejectedWith('add-tag-not-found');
  });

  it('cannot add tag to set if set created by another user', async () => {
    const owner = await stubUser();
    const patternId = await callMethodWithUser(
      owner._id,
      'pattern.add',
      addPatternDataIndividual,
    );
    const setIdLocal = await callMethodWithUser(owner._id, 'set.add', {
      patternId,
      name: 'Test Set',
    });
    const otherUser = await stubOtherUser();
    const expectedError = async () => {
      await callMethodWithUser(otherUser._id, 'tags.add', {
        targetId: setIdLocal,
        targetType: 'set',
        name: 'easy',
      });
    };
    await expect(expectedError()).to.be.rejectedWith(
      'add-tag-not-created-by-user',
    );
  });

  it('can add tag to set', async () => {
    const user = await stubUser();
    const patternId = await callMethodWithUser(
      user._id,
      'pattern.add',
      addPatternDataIndividual,
    );
    const setIdLocal = await callMethodWithUser(user._id, 'set.add', {
      patternId,
      name: 'Test Set',
    });
    const tagText = 'easy';
    await callMethodWithUser(user._id, 'tags.add', {
      targetId: setIdLocal,
      targetType: 'set',
      name: tagText,
    });
    const newTag = await Tags.findOneAsync({ name: tagText });
    assert.equal(newTag.name, tagText);
    const updatedSet = await Sets.findOneAsync({ _id: setIdLocal });
    assert.notEqual(updatedSet.tags.indexOf(tagText), -1);
  });

  it('can assign tag to set', async () => {
    const user = await stubUser();
    const patternId = await callMethodWithUser(
      user._id,
      'pattern.add',
      addPatternDataIndividual,
    );
    const setIdLocal = await callMethodWithUser(user._id, 'set.add', {
      patternId,
      name: 'Test Set',
    });
    const tagText = 'easy';
    await Tags.insertAsync({ name: tagText });
    await callMethodWithUser(user._id, 'tags.assignToDocument', {
      targetId: setIdLocal,
      targetType: 'set',
      name: tagText,
    });
    const updatedSet = await Sets.findOneAsync({ _id: setIdLocal });
    assert.notEqual(updatedSet.tags.indexOf(tagText), -1);
  });

  it('can ensureExistsAndAssignToDocument with new tag on set', async () => {
    const user = await stubUser();
    const patternId = await callMethodWithUser(
      user._id,
      'pattern.add',
      addPatternDataIndividual,
    );
    const setIdLocal = await callMethodWithUser(user._id, 'set.add', {
      patternId,
      name: 'Test Set',
    });
    const tagText = 'easy';
    await callMethodWithUser(user._id, 'tags.ensureExistsAndAssignToDocument', {
      targetId: setIdLocal,
      targetType: 'set',
      name: tagText,
    });
    const updatedSet = await Sets.findOneAsync({ _id: setIdLocal });
    assert.notEqual(updatedSet.tags.indexOf(tagText), -1);
  });

  it('can remove tag from set', async () => {
    const user = await stubUser();
    const patternId = await callMethodWithUser(
      user._id,
      'pattern.add',
      addPatternDataIndividual,
    );
    const setIdLocal = await callMethodWithUser(user._id, 'set.add', {
      patternId,
      name: 'Test Set',
    });
    const tagText = 'easy';
    await callMethodWithUser(user._id, 'tags.ensureExistsAndAssignToDocument', {
      targetId: setIdLocal,
      targetType: 'set',
      name: tagText,
    });
    await callMethodWithUser(user._id, 'tags.removeFromDocument', {
      targetId: setIdLocal,
      targetType: 'set',
      name: tagText,
    });
    const updatedSet = await Sets.findOneAsync({ _id: setIdLocal });
    assert.equal(updatedSet.tags.indexOf(tagText), -1);
  });
});
/* eslint-env mocha */
// test for tags methods

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import { Patterns, Tags, Sets } from '../../imports/modules/collection';
import '../methods/tags';
import {
  stubNoUser,
  stubOtherUser,
  stubUser,
  unwrapUser,
  callMethodWithUser,
} from './mockUser';
import {
  MAX_TAG_LENGTH,
  MIN_TAG_LENGTH,
} from '../../imports/modules/parameters';
import { addPatternDataIndividual } from './testData';

if (Meteor.isServer) {
  describe('test methods for tags', function testTagMethods() {
    // eslint-disable-line func-names
    this.timeout(15000);

    beforeEach(async function () {
      await unwrapUser();
      await resetDatabase();
      await ensureAllRolesExist();
      this.currentUser = await stubUser();
      this.patternId = await callMethodWithUser(
        this.currentUser._id,
        'pattern.add',
        addPatternDataIndividual,
      );
    });

    afterEach(async () => {
      await unwrapUser();
    });

    describe('tags.add method', () => {
      // create a tag and assign it to a pattern
      it('cannot add tag to pattern if not logged in', async () => {
        // Create a pattern as a valid user, then log out
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        await unwrapUser();
        await stubNoUser();
        const expectedError = async () => {
          await Meteor.callAsync('tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: 'easy',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'add-tag-not-logged-in',
        );
      });

      it('cannot add tag to pattern if pattern not found', async () => {
        const user = await stubUser();
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.add', {
            targetId: 'nonexistentpatternid',
            targetType: 'pattern',
            name: 'easy',
          });
        };
        await expect(expectedError()).to.be.rejectedWith('add-tag-not-found');
      });

      it('cannot add tag to pattern if pattern created by another user', async () => {
        // Create a pattern as one user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(
          owner._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        // Try to add as a different user
        const otherUser = await stubOtherUser();
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: 'easy',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'add-tag-not-created-by-user',
        );
      });

      it('cannot add tag to pattern if the tag already exists', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        await Tags.insertAsync({ name: 'easy' });
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: 'easy',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'add-tag-already-exists',
        );
      });

      it('cannot add tag to pattern if the tag name is too short', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        let tagText = '';
        for (let i = 0; i < MIN_TAG_LENGTH - 1; i += 1) {
          tagText += 'a';
        }
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith('add-tag-too-short');
      });

      it('cannot add tag to pattern if the tag name is too long', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        let tagText = '';
        for (let i = 0; i < MAX_TAG_LENGTH + 1; i += 1) {
          tagText += 'a';
        }
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.add', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith('add-tag-too-long');
      });

      it('can add tag to pattern', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await callMethodWithUser(user._id, 'tags.add', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });
        const newTag = await Tags.findOneAsync({ name: tagText });
        assert.equal(newTag.name, tagText);
        const updatedPattern = await Patterns.findOneAsync({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });

      it('converts the tag text to lowercase', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'EaSy';
        const processedTagText = tagText.toLowerCase();
        await callMethodWithUser(user._id, 'tags.add', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });
        const newTag = await Tags.findOneAsync({ name: processedTagText });
        assert.equal(newTag.name, processedTagText);
        const updatedPattern = await Patterns.findOneAsync({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(processedTagText), -1);
      });
    });

    describe('tags.assignToDocument method', () => {
      // assign an existing tag to a pattern
      it('cannot assign tag to pattern if not logged in', async () => {
        // Create pattern and tag as a valid user, then log out
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });
        await unwrapUser();
        await stubNoUser();
        const expectedError = async () => {
          await Meteor.callAsync('tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'assign-tag-not-logged-in',
        );
      });

      it('cannot assign tag to pattern if pattern not found', async () => {
        const user = await stubUser();
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.assignToDocument', {
            targetId: 'nonexistentpatternid',
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'assign-tag-not-found',
        );
      });

      it('cannot assign tag to pattern if pattern created by another user', async () => {
        // Create pattern as one user, tag as any user, then try as another user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(
          owner._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });
        const otherUser = await stubOtherUser();
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'assign-tag-not-created-by-user',
        );
      });

      it("cannot assign tag to pattern if the tag doesn't exist", async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'assign-tag-not-found',
        );
      });

      it('cannot assign tag to pattern if tag already assigned to pattern', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });
        await Patterns.updateAsync(
          { _id: patternId },
          { $push: { tags: tagText } },
        );
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.assignToDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'assign-tag-already-assigned',
        );
      });

      it('can assign tag to pattern', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });
        await callMethodWithUser(user._id, 'tags.assignToDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });
        const tag = await Tags.findOneAsync({ name: tagText });
        assert.equal(tag.name, tagText);
        const updatedPattern = await Patterns.findOneAsync({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
    });
    describe('tags.ensureExistsAndAssignToDocument method', () => {
      // create a tag if it doesn't exist and assign it to a pattern
      // this calls tags.assignToDocument so we don't need to recheck permissions
      it('can ensureExistsAndAssignToDocument with existing tag', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await Tags.insertAsync({ name: tagText });
        await callMethodWithUser(
          user._id,
          'tags.ensureExistsAndAssignToDocument',
          {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          },
        );
        const tag = await Tags.findOneAsync({ name: tagText });
        assert.equal(tag.name, tagText);
        const updatedPattern = await Patterns.findOneAsync({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
      it('can ensureExistsAndAssignToDocument with new tag', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await callMethodWithUser(
          user._id,
          'tags.ensureExistsAndAssignToDocument',
          {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          },
        );
        const tag = await Tags.findOneAsync({ name: tagText });
        assert.equal(tag.name, tagText);
        const updatedPattern = await Patterns.findOneAsync({ _id: patternId });
        assert.notEqual(updatedPattern.tags.indexOf(tagText), -1);
      });
    });

    describe('tags.removeFromDocument method', () => {
      it('cannot remove tag if not logged in', async () => {
        // Create pattern/tag as valid user, assign, then log out
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await callMethodWithUser(
          user._id,
          'tags.ensureExistsAndAssignToDocument',
          {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          },
        );
        await unwrapUser();
        await stubNoUser();
        const expectedError = async () => {
          await Meteor.callAsync('tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-tag-not-logged-in',
        );
      });

      it('cannot remove tag if pattern not found', async () => {
        const user = await stubUser();
        const patternId = 'nonexistentpatternid';
        const tagText = 'easy';
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-tag-not-found',
        );
      });

      it('cannot remove tag if pattern created by another user', async () => {
        // Create pattern/tag as one user, assign, then try as another user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(
          owner._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await callMethodWithUser(
          owner._id,
          'tags.ensureExistsAndAssignToDocument',
          {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          },
        );
        const otherUser = await stubOtherUser();
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-tag-not-created-by-user',
        );
      });

      it('cannot remove tag if tag not assigned to the pattern', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'tags.removeFromDocument', {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-tag-not-assigned',
        );
      });
      it('can remove the tag', async () => {
        const user = await stubUser();
        const patternId = await callMethodWithUser(
          user._id,
          'pattern.add',
          addPatternDataIndividual,
        );
        const tagText = 'easy';
        await callMethodWithUser(
          user._id,
          'tags.ensureExistsAndAssignToDocument',
          {
            targetId: patternId,
            targetType: 'pattern',
            name: tagText,
          },
        );
        await callMethodWithUser(user._id, 'tags.removeFromDocument', {
          targetId: patternId,
          targetType: 'pattern',
          name: tagText,
        });
        const updatedPattern = await Patterns.findOneAsync({ _id: patternId });
        const { tags } = updatedPattern;
        const index = tags.indexOf(tagText);
        assert.equal(index, -1);
        const tag = await Tags.findOneAsync({ name: tagText });
        assert.equal(tag, undefined);
      });
    });
  });
}
