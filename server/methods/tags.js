import { check } from 'meteor/check';
import { nonEmptyStringCheck } from '../../imports/server/modules/utils';
import { Patterns, Sets, Tags } from '../../imports/modules/collection';
import {
  MIN_TAG_LENGTH,
  MAX_TAG_LENGTH,
} from '../../imports/modules/parameters';

// Tags can be assigned to patterns or sets

function getTagTargetCollection(targetType) {
  switch (targetType) {
    case 'pattern':
      return Patterns;

    case 'set':
      return Sets;

    default:
      break;
  }
}

Meteor.methods({
  'tags.add': async function ({ name, targetId, targetType }) {
    // tags are created when a new text is assigned to a document
    check(name, nonEmptyStringCheck);
    check(targetId, nonEmptyStringCheck);
    check(targetType, nonEmptyStringCheck);

    // ensure all tags are lower case
    const processedName = name.toLowerCase();

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'add-tag-not-logged-in',
        'Unable to create tag because the user is not logged in',
      );
    }

    const collection = getTagTargetCollection(targetType);
    const document = await collection.findOneAsync({ _id: targetId });

    if (!document) {
      throw new Meteor.Error(
        'add-tag-not-found',
        'Unable to add tag because the document was not found',
      );
    }

    if (document.createdBy !== Meteor.userId()) {
      throw new Meteor.Error(
        'add-tag-not-created-by-user',
        'Unable to add tag because the document was not created by the current logged in user',
      );
    }

    // check the name does not already exist
    const existingCount = await Tags.find({ name: processedName }).countAsync();

    if (existingCount > 0) {
      throw new Meteor.Error(
        'add-tag-already-exists',
        'Unable to add tag because a tag with that name already exists',
      );
    }

    // check the name is long enough
    if (processedName.length < MIN_TAG_LENGTH) {
      throw new Meteor.Error(
        'add-tag-too-short',
        `Unable to add tag because tag must be at least ${MIN_TAG_LENGTH} characters`,
      );
    }

    // check the name is not too long
    if (processedName.length > MAX_TAG_LENGTH) {
      throw new Meteor.Error(
        'add-tag-too-long',
        `Unable to add tag because tag must be no longer than ${MAX_TAG_LENGTH} characters`,
      );
    }

    const tagId = await Tags.insertAsync({
      name: processedName,
    });

    if (!document.tags) {
      await collection.updateAsync({ _id: targetId }, { $set: { tags: [] } });
    }

    await collection.updateAsync(
      { _id: targetId },
      { $push: { tags: processedName } },
    );

    return tagId;
  },
  'tags.assignToDocument': async function ({ name, targetId, targetType }) {
    // assign an existing tag to a document
    check(name, nonEmptyStringCheck);
    check(targetId, nonEmptyStringCheck);
    check(targetType, nonEmptyStringCheck);

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'assign-tag-not-logged-in',
        'Unable to assign tag because the user is not logged in',
      );
    }

    const collection = getTagTargetCollection(targetType);
    const document = await collection.findOneAsync({ _id: targetId });

    if (!document) {
      throw new Meteor.Error(
        'assign-tag-not-found',
        'Unable to assign tag because the document was not found',
      );
    }

    if (document.createdBy !== Meteor.userId()) {
      throw new Meteor.Error(
        'assign-tag-not-created-by-user',
        'Unable to assign tag because the document was not created by the current logged in user',
      );
    }

    // check the tag exists
    const existing = await Tags.findOneAsync({ name });
    if (!existing) {
      throw new Meteor.Error(
        'assign-tag-not-found',
        'Unable to assign tag because the tag was not found',
      );
    }

    // check the tag is not already assigned to the document
    if (document.tags.indexOf(name) !== -1) {
      throw new Meteor.Error(
        'assign-tag-already-assigned',
        'Unable to assign tag because the tag is already assigned to the document',
      );
    }

    await collection.updateAsync({ _id: targetId }, { $push: { tags: name } });
  },
  'tags.ensureExistsAndAssignToDocument': async function ({
    name,
    targetId,
    targetType,
  }) {
    check(name, nonEmptyStringCheck);
    check(targetId, nonEmptyStringCheck);
    check(targetType, nonEmptyStringCheck);

    // create the tag if it does not already exist
    const existing = await Tags.findOneAsync({ name });

    if (!existing) {
      await Meteor.callAsync('tags.add', {
        name,
        targetId,
        targetType,
      });
    } else {
      // check the tag isn't already assigned to the document
      const collection = getTagTargetCollection(targetType);
      const document = await collection.findOneAsync({ _id: targetId });

      const { tags } = document;
      if (tags.indexOf(name) === -1) {
        await Meteor.callAsync('tags.assignToDocument', {
          targetId,
          targetType,
          name,
        });
      }
    }
  },
  'tags.removeFromDocument': async function ({ name, targetId, targetType }) {
    // remove an existing tag from a document
    check(name, nonEmptyStringCheck);
    check(targetId, nonEmptyStringCheck);
    check(targetType, nonEmptyStringCheck);

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'remove-tag-not-logged-in',
        'Unable to remove tag because the user is not logged in',
      );
    }

    const collection = getTagTargetCollection(targetType);
    const document = await collection.findOneAsync({ _id: targetId });

    if (!document) {
      throw new Meteor.Error(
        'remove-tag-not-found',
        'Unable to remove tag because the document was not found',
      );
    }

    if (document.createdBy !== Meteor.userId()) {
      throw new Meteor.Error(
        'remove-tag-not-created-by-user',
        'Unable to remove tag because the document was not created by the current logged in user',
      );
    }

    // check the tag is assigned to the document
    if (document.tags.indexOf(name) === -1) {
      throw new Meteor.Error(
        'remove-tag-not-assigned',
        'Unable to remove tag because the tag is not assigned to the document',
      );
    }

    // Remove the tag from the document
    await collection.updateAsync({ _id: targetId }, { $pull: { tags: name } });

    // Delete unused tag
    await Meteor.callAsync('tags.removeUnused', name);
  },
  'tags.removeUnused': async function (names) {
    // remove any tags that are no longer referenced
    check(names, Match.OneOf([nonEmptyStringCheck], nonEmptyStringCheck));

    let namesArray = [];
    if (typeof names === 'string') {
      namesArray.push(names);
    } else {
      namesArray = [...names];
    }

    const checkNames = async (name) => {
      const patternsCount = await Patterns.find({ tags: name }).countAsync();
      const setsCount = await Sets.find({ tags: name }).countAsync();
      if (patternsCount === 0 && setsCount === 0) {
        await Tags.removeAsync({ name });
      }
    };

    for (let i = 0; i < namesArray.length; i += 1) {
      await checkNames(namesArray[i]);
    }
  },
});
