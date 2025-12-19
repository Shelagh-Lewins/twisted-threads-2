import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Patterns, Sets, Tags, ColorBooks, FAQ, ActionsLog, PatternPreviews, PatternImages } from '/imports/modules/collection';
import { getPatternPermissionQuery, getSetPermissionQuery, getUserPermissionQuery } from '/imports/modules/permissionQueries';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Meteor.startup(async () => {
  try {
    // create text indexes to support $text searches; safe to call multiple times
    await Patterns.rawCollection().createIndex({ nameSort: 'text', name: 'text', tags: 'text' });
    await Sets.rawCollection().createIndex({ nameSort: 'text', name: 'text', tags: 'text' });
    await Meteor.users.rawCollection().createIndex({ username: 'text' });
    await Tags.rawCollection().createIndex({ name: 'text' });

    // create single-field btree indexes for fields that previously used `index: 1` in SimpleSchema
    // Patterns
    await Patterns.rawCollection().createIndex({ createdAt: 1 }, { background: true });
    await Patterns.rawCollection().createIndex({ createdBy: 1 }, { background: true });
    await Patterns.rawCollection().createIndex({ isPublic: 1 }, { background: true });
    await Patterns.rawCollection().createIndex({ modifiedAt: 1 }, { background: true });
    await Patterns.rawCollection().createIndex({ numberOfTablets: 1 }, { background: true });
    await Patterns.rawCollection().createIndex({ sets: 1 }, { background: true });
    await Patterns.rawCollection().createIndex({ tags: 1 }, { background: true });

    // ColorBooks
    await ColorBooks.rawCollection().createIndex({ createdAt: 1 }, { background: true });
    await ColorBooks.rawCollection().createIndex({ createdBy: 1 }, { background: true });
    await ColorBooks.rawCollection().createIndex({ isPublic: 1 }, { background: true });
    await ColorBooks.rawCollection().createIndex({ nameSort: 1 }, { background: true });

    // FAQ
    await FAQ.rawCollection().createIndex({ question: 1 }, { background: true });

    // ActionsLog
    await ActionsLog.rawCollection().createIndex({ userId: 1 }, { background: true });

    // PatternPreviews
    await PatternPreviews.rawCollection().createIndex({ patternId: 1 }, { background: true });

    // Sets
    await Sets.rawCollection().createIndex({ createdAt: 1 }, { background: true });
    await Sets.rawCollection().createIndex({ createdBy: 1 }, { background: true });
    await Sets.rawCollection().createIndex({ nameSort: 1 }, { background: true });
    await Sets.rawCollection().createIndex({ publicPatternsCount: 1 }, { background: true });
    await Sets.rawCollection().createIndex({ tags: 1 }, { background: true });

    // PatternImages
    await PatternImages.rawCollection().createIndex({ createdAt: 1 }, { background: true });
    await PatternImages.rawCollection().createIndex({ createdBy: 1 }, { background: true });
    await PatternImages.rawCollection().createIndex({ patternId: 1 }, { background: true });

    // Tags
    await Tags.rawCollection().createIndex({ name: 1 }, { background: true });
    console.info('Search indexes created (or already existed).');
  } catch (err) {
    console.error('Could not create search indexes (check DB privileges):', err);
  }
});

// publish matching patterns
Meteor.publish('search.patterns', async function (searchTerm, limit = 20) {
  check(searchTerm, String);
  check(limit, Number);

  const permission = getPatternPermissionQuery();
  const trimmed = searchTerm.trim();

  let selector = permission;

  if (trimmed) {
    const regex = new RegExp(escapeRegExp(trimmed), 'i');
    const matchingTags = await Tags.find({ name: { $regex: regex } }).fetchAsync();
    const matchingTagNames = matchingTags.map(t => t.name);

    selector = {
      $and: [
        permission,
        {
          $or: [
            { $text: { $search: trimmed } },
            { nameSort: { $regex: regex } },
            { name: { $regex: regex } },
          ],
        },
      ],
    };

    if (matchingTagNames.length) {
      selector.$and[1].$or.push({ tags: { $in: matchingTagNames } });
    }
  }

  const fields = {
    _id: 1,
    createdBy: 1,
    name: 1,
    numberOfTablets: 1,
    nameSort: 1,
    tags: 1,
  };

  const sort = trimmed ? { score: { $meta: 'textScore' } } : { nameSort: 1 };

  const cursor = Patterns.find(selector, { fields, sort, limit });

  // publish owners for username lookup
  const patterns = await cursor.fetchAsync();
  const userIds = Array.from(new Set(patterns.map(p => p.createdBy).filter(Boolean)));

  return [
    cursor,
    userIds.length ? Meteor.users.find({ _id: { $in: userIds } }, { fields: { username: 1 } }) : this.ready(),
  ];
});

// publish matching users
Meteor.publish('search.users', function (searchTerm, limit = 20) {
  check(searchTerm, String);
  check(limit, Number);

  const permission = getUserPermissionQuery();
  const trimmed = searchTerm.trim();

  let selector = permission;

  if (trimmed) {
    const regex = new RegExp(escapeRegExp(trimmed), 'i');
    selector = {
      $and: [
        permission,
        {
          $or: [
            { $text: { $search: trimmed } },
            { username: { $regex: regex } },
          ],
        },
      ],
    };
  }

  const fields = { _id: 1, username: 1 };
  const sort = trimmed ? { score: { $meta: 'textScore' } } : { username: 1 };

  return Meteor.users.find(selector, { fields, sort, limit });
});

// publish matching sets
Meteor.publish('search.sets', async function (searchTerm, limit = 20) {
  check(searchTerm, String);
  check(limit, Number);

  const permission = getSetPermissionQuery();
  const trimmed = searchTerm.trim();

  let selector = permission;

  if (trimmed) {
    const regex = new RegExp(escapeRegExp(trimmed), 'i');
    const matchingTags = await Tags.find({ name: { $regex: regex } }).fetchAsync();
    const matchingTagNames = matchingTags.map(t => t.name);

    selector = {
      $and: [
        permission,
        {
          $or: [
            { $text: { $search: trimmed } },
            { nameSort: { $regex: regex } },
            { name: { $regex: regex } },
          ],
        },
      ],
    };

    if (matchingTagNames.length) {
      selector.$and[1].$or.push({ tags: { $in: matchingTagNames } });
    }
  }

  const fields = {
    _id: 1,
    createdBy: 1,
    name: 1,
    nameSort: 1,
    patterns: 1,
    publicPatternsCount: 1,
  };

  const sort = trimmed ? { score: { $meta: 'textScore' } } : { nameSort: 1 };

  const cursor = Sets.find(selector, { fields, sort, limit });

  const sets = await cursor.fetchAsync();
  const userIds = Array.from(new Set(sets.map(s => s.createdBy).filter(Boolean)));

  return [
    cursor,
    userIds.length ? Meteor.users.find({ _id: { $in: userIds } }, { fields: { username: 1 } }) : this.ready(),
  ];
});
