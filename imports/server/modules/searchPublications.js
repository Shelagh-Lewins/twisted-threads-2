import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
  Patterns,
  Sets,
  Tags,
  ColorBooks,
  FAQ,
  ActionsLog,
  PatternPreviews,
  PatternImages,
} from '/imports/modules/collection';
import {
  getPatternPermissionQuery,
  getSetPermissionQuery,
  getUserPermissionQuery,
} from '/imports/modules/permissionQueries';
import { NUMBER_OF_THUMBNAILS_IN_SET } from '../../modules/parameters';
import { asyncForEach } from './utils';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Meteor.startup(async () => {
  try {
    // create text indexes to support $text searches; safe to call multiple times
    await Patterns.rawCollection().createIndex({
      nameSort: 'text',
      name: 'text',
      tags: 'text',
    });
    await Sets.rawCollection().createIndex({
      nameSort: 'text',
      name: 'text',
      tags: 'text',
    });
    await Meteor.users.rawCollection().createIndex({ username: 'text' });
    await Tags.rawCollection().createIndex({ name: 'text' });

    // create single-field btree indexes for fields that previously used `index: 1` in SimpleSchema
    // Patterns
    await Patterns.rawCollection().createIndex(
      { createdAt: 1 },
      { background: true },
    );
    await Patterns.rawCollection().createIndex(
      { createdBy: 1 },
      { background: true },
    );
    await Patterns.rawCollection().createIndex(
      { isPublic: 1 },
      { background: true },
    );
    await Patterns.rawCollection().createIndex(
      { modifiedAt: 1 },
      { background: true },
    );
    await Patterns.rawCollection().createIndex(
      { numberOfTablets: 1 },
      { background: true },
    );
    await Patterns.rawCollection().createIndex(
      { sets: 1 },
      { background: true },
    );
    await Patterns.rawCollection().createIndex(
      { tags: 1 },
      { background: true },
    );

    // ColorBooks
    await ColorBooks.rawCollection().createIndex(
      { createdAt: 1 },
      { name: 'c2_createdAt', background: true },
    );
    await ColorBooks.rawCollection().createIndex(
      { createdBy: 1 },
      { name: 'c2_createdBy', background: true },
    );
    await ColorBooks.rawCollection().createIndex(
      { isPublic: 1 },
      { name: 'c2_isPublic', background: true },
    );
    await ColorBooks.rawCollection().createIndex(
      { nameSort: 1 },
      { name: 'c2_nameSort', background: true },
    );

    // FAQ
    await FAQ.rawCollection().createIndex(
      { question: 1 },
      { background: true },
    );

    // ActionsLog
    await ActionsLog.rawCollection().createIndex(
      { userId: 1 },
      { background: true },
    );

    // PatternPreviews
    await PatternPreviews.rawCollection().createIndex(
      { patternId: 1 },
      { background: true },
    );

    // Sets
    await Sets.rawCollection().createIndex(
      { createdAt: 1 },
      { background: true },
    );
    await Sets.rawCollection().createIndex(
      { createdBy: 1 },
      { background: true },
    );
    await Sets.rawCollection().createIndex(
      { nameSort: 1 },
      { background: true },
    );
    await Sets.rawCollection().createIndex(
      { publicPatternsCount: 1 },
      { background: true },
    );
    await Sets.rawCollection().createIndex({ tags: 1 }, { background: true });

    // PatternImages
    await PatternImages.rawCollection().createIndex(
      { createdAt: 1 },
      { background: true },
    );
    await PatternImages.rawCollection().createIndex(
      { createdBy: 1 },
      { background: true },
    );
    await PatternImages.rawCollection().createIndex(
      { patternId: 1 },
      { background: true },
    );

    // Tags
    await Tags.rawCollection().createIndex({ name: 1 }, { background: true });
    console.info('Search indexes created (or already existed).');
  } catch (err) {
    console.error(
      'Could not create search indexes (check DB privileges):',
      err,
    );
  }
});

// publish matching patterns
Meteor.publish('search.patterns', async function (searchTerm, limit = 20) {
  check(searchTerm, String);
  check(limit, Number);

  const trimmed = searchTerm.trim();

  // Return nothing if no search term provided
  if (!trimmed) {
    this.ready();
    return;
  }

  const permission = getPatternPermissionQuery(this.userId);

  const regex = new RegExp(escapeRegExp(trimmed), 'i');
  const matchingTags = await Tags.find({
    name: { $regex: regex },
  }).fetchAsync();
  const matchingTagNames = matchingTags.map((t) => t.name);

  const searchConditions = [
    { name: { $regex: regex } },
    { nameSort: { $regex: regex } },
  ];

  if (matchingTagNames.length) {
    searchConditions.push({ tags: { $in: matchingTagNames } });
  }

  const selector = {
    $and: [permission, { $or: searchConditions }],
  };

  const fields = {
    _id: 1,
    createdBy: 1,
    name: 1,
    numberOfTablets: 1,
    nameSort: 1,
    tags: 1,
  };

  const sort = { nameSort: 1 };

  const patterns = await Patterns.find(selector, {
    fields,
    sort,
    limit,
  }).fetchAsync();

  // fetch usernames for pattern owners
  const userIds = Array.from(
    new Set(patterns.map((p) => p.createdBy).filter(Boolean)),
  );
  const users = await Meteor.users
    .find(
      { _id: { $in: userIds.length ? userIds : [] } },
      { fields: { username: 1 } },
    )
    .fetchAsync();
  const usernameMap = Object.fromEntries(users.map((u) => [u._id, u.username]));

  // publish to dedicated searchPatterns collection with username included
  patterns.forEach((pattern) => {
    this.added('searchPatterns', pattern._id, {
      ...pattern,
      username: usernameMap[pattern.createdBy] || '',
    });
  });

  this.ready();
});

// publish matching users
Meteor.publish('search.users', async function (searchTerm, limit = 20) {
  check(searchTerm, String);
  check(limit, Number);

  const trimmed = searchTerm.trim();

  // Return nothing if no search term provided
  if (!trimmed) {
    this.ready();
    return;
  }

  const permission = getUserPermissionQuery(this.userId);

  const regex = new RegExp(escapeRegExp(trimmed), 'i');
  const selector = {
    $and: [permission, { username: { $regex: regex } }],
  };

  const fields = { _id: 1, username: 1 };
  const sort = { username: 1 };

  const users = await Meteor.users
    .find(selector, { fields, sort, limit })
    .fetchAsync();

  // publish to dedicated searchUsers collection
  users.forEach((user) => {
    this.added('searchUsers', user._id, user);
  });

  this.ready();
});

// publish matching sets
Meteor.publish('search.sets', async function (searchTerm, limit = 20) {
  console.log(
    'search.sets arguments:',
    arguments,
    'searchTerm:',
    searchTerm,
    'typeof:',
    typeof searchTerm,
  );
  check(searchTerm, String);
  check(limit, Number);
  console.log('search.sets called with term:', searchTerm, 'limit:', limit);
  const trimmed = searchTerm.trim();

  // Return nothing if no search term provided
  if (!trimmed) {
    this.ready();
    return;
  }

  const permission = getSetPermissionQuery(this.userId);

  const regex = new RegExp(escapeRegExp(trimmed), 'i');
  const matchingTags = await Tags.find({
    name: { $regex: regex },
  }).fetchAsync();
  const matchingTagNames = matchingTags.map((t) => t.name);

  const searchConditions = [
    { name: { $regex: regex } },
    { nameSort: { $regex: regex } },
  ];

  if (matchingTagNames.length) {
    searchConditions.push({ tags: { $in: matchingTagNames } });
  }

  const selector = {
    $and: [permission, { $or: searchConditions }],
  };

  const fields = {
    _id: 1,
    createdBy: 1,
    name: 1,
    nameSort: 1,
    patterns: 1,
    publicPatternsCount: 1,
  };

  const sort = { nameSort: 1 };

  const sets = await Sets.find(selector, { fields, sort, limit }).fetchAsync();

  // fetch usernames for set owners
  const userIds = Array.from(
    new Set(sets.map((s) => s.createdBy).filter(Boolean)),
  );
  const users = await Meteor.users
    .find(
      { _id: { $in: userIds.length ? userIds : [] } },
      { fields: { username: 1 } },
    )
    .fetchAsync();
  const usernameMap = Object.fromEntries(users.map((u) => [u._id, u.username]));

  // publish to dedicated searchSets collection with username and preview patterns included

  // use a simple loop, not forEach with async calls inside
  // to make sure awaits complete before publication is marked ready
  for (const set of sets) {
    let previewPatterns = [];
    if (Array.isArray(set.patterns) && set.patterns.length > 0) {
      const patternIds = set.patterns.slice(0, NUMBER_OF_THUMBNAILS_IN_SET);
      previewPatterns = await Patterns.find(
        { _id: { $in: patternIds } },
        { fields: { _id: 1, name: 1, createdBy: 1 } },
      ).fetch();
    }

    this.added('searchSets', set._id, {
      ...set,
      patterns: previewPatterns,
      username: usernameMap[set.createdBy] || '',
    });
  }

  this.ready();
});
