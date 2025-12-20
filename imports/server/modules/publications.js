import { check } from 'meteor/check';
import { Roles } from 'meteor/roles';
import {
  ColorBooks,
  FAQ,
  PatternImages,
  PatternPreviews,
  Patterns,
  Sets,
  Tags,
} from '../../modules/collection';
import {
  // ITEMS_PER_PAGE,
  ITEMS_PER_PREVIEW_LIST,
  USER_FIELDS,
} from '../../modules/parameters';
import {
  getPatternFilter,
  nonEmptyStringCheck,
  positiveIntegerCheck,
} from './utils';
import {
  getPatternPermissionQuery,
  getSetPermissionQuery,
  getUserPermissionQuery,
} from '../../modules/permissionQueries';
// arrow functions lose "this" context
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

// don't allow users to edit their profile
// https://docs.meteor.com/api/accounts.html
Meteor.users.deny({ update: () => true });

// note: if there is ever a need to publish nothing when the user is not logged in, the function should return explicitly like this:
/*
if (!this.userId) {
	this.ready();
	return;
}
*/
// this is so we can test behaviour when user is not logged in: PublicationCollector passes in undefined userId, and find() is inconsistent between Meteor and MongoDB on undefined

// Meteor._sleepForMs(3000); // simulate server delay in a publish function

// //////////////////////////
// Color books

const ColorBooksFields = {
  colors: 1,
  createdAt: 1,
  createdBy: 1,
  isPublic: 1,
  name: 1,
  nameSort: 1,
};

Meteor.publish('colorBooks', function (userId) {
  check(userId, Match.Maybe(nonEmptyStringCheck));

  // color books created by a particular user
  if (userId) {
    return ColorBooks.find(
      {
        $and: [getPatternPermissionQuery(this.userId), { createdBy: userId }],
      },
      {
        fields: ColorBooksFields,
        sort: { nameSort: 1 },
      },
    );
  }

  // all color books the user can see
  return ColorBooks.find(getPatternPermissionQuery(this.userId), {
    fields: ColorBooksFields,
    sort: { nameSort: 1 },
  });
});

// //////////////////////////
// Patterns

// limited fields for all patterns
// must include anything that can be searched
const patternsFields = {
  createdAt: 1,
  createdBy: 1,
  description: 1,
  holes: 1,
  isTwistNeutral: 1,
  isPublic: 1,
  name: 1,
  nameSort: 1,
  numberOfRows: 1,
  numberOfTablets: 1,
  patternType: 1,
  tags: 1,
  willRepeat: 1,
};

// the field 'sets' is not published because it is only used on the server. If there is ever a feature added to show the sets to which a pattern belongs, then it could be published.

// additional fields for individual pattern
const patternFields = {
  ...patternsFields,
  ...{
    holeHandedness: 1,
    includeInTwist: 1,
    orientations: 1,
    palette: 1,
    patternDesign: 1,
    previewOrientation: 1,
    tabletGuides: 1,
    threading: 1,
    threadingNotes: 1,
    weavingNotes: 1,
    weftColor: 1,
  },
};

// ////////////////////////////////
// All patterns
Meteor.publish(
  'patterns',
  function ({
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
    skip = 0,
    limit,
  }) {
    // this needs to return the same number of patterns as the getPatternCount method, for pagination
    check(filterIsTwistNeutral, Match.Maybe(Boolean));
    check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
    check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
    check(filterWillRepeat, Match.Maybe(Boolean));
    check(limit, positiveIntegerCheck);
    check(skip, positiveIntegerCheck);

    return Patterns.find(
      {
        $and: [
          getPatternFilter({
            filterIsTwistNeutral,
            filterMaxTablets,
            filterMinTablets,
            filterWillRepeat,
          }),
          getPatternPermissionQuery(this.userId),
        ],
      },
      {
        fields: patternsFields,
        sort: { nameSort: 1 },
        skip,
        limit,
      },
    );
  },
);

Meteor.publish('patternsById', function (patternIds) {
  check(patternIds, [nonEmptyStringCheck]);

  return Patterns.find(
    {
      $and: [
        { _id: { $in: patternIds } },
        getPatternPermissionQuery(this.userId),
      ],
    },
    {
      fields: patternsFields,
    },
  );
});

// individual pattern
Meteor.publish('pattern', function (_id) {
  check(_id, nonEmptyStringCheck);

  // NOTE: For serviceUser role check, we would need async but that complicates cursor return
  // For now, serviceUsers rely on the permission query allowing them to see any pattern
  // This could be enhanced later with proper async publication pattern

  return Patterns.find(
    {
      $and: [{ _id }, getPatternPermissionQuery(this.userId)],
    },
    {
      fields: patternFields,
      limit: 1,
    },
  );
});

// preview list for all patterns
// displayed on Home page
Meteor.publish('allPatternsPreview', function () {
  return Patterns.find(getPatternPermissionQuery(this.userId), {
    fields: patternsFields,
    limit: ITEMS_PER_PREVIEW_LIST,
    sort: { nameSort: 1 },
  });
});

// preview list for my patterns (my patterns main page uses userPattern publication
// displayed on Home page
Meteor.publish('myPatternsPreview', function () {
  if (this.userId) {
    return Patterns.find(
      { createdBy: this.userId },
      {
        fields: patternsFields,
        limit: ITEMS_PER_PREVIEW_LIST,
        sort: { nameSort: 1 },
      },
    );
  }

  this.ready();
});

// ////////////////////////////////
// New patterns
// returns all patterns, but sorted by creation date
Meteor.publish(
  'newPatterns',
  function ({
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
    skip = 0,
    limit,
  }) {
    // this needs to return the same number of patterns as the getPatternCount method, for pagination
    check(filterIsTwistNeutral, Match.Maybe(Boolean));
    check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
    check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
    check(filterWillRepeat, Match.Maybe(Boolean));
    check(limit, positiveIntegerCheck);
    check(skip, positiveIntegerCheck);

    const patternsToPublish = Patterns.find(
      {
        $and: [
          getPatternFilter({
            filterIsTwistNeutral,
            filterMaxTablets,
            filterMinTablets,
            filterWillRepeat,
          }),
          getPatternPermissionQuery(this.userId),
        ],
      },
      {
        fields: patternsFields,
        sort: { createdAt: -1 },
        skip,
        limit,
      },
    );

    return patternsToPublish;
  },
);

// preview list for new patterns
// displayed on Home page
// only public patterns to reduce overlap with Recents
Meteor.publish('newPatternsPreview', function () {
  return Patterns.find(
    { isPublic: { $eq: true } },
    {
      fields: patternsFields,
      limit: ITEMS_PER_PREVIEW_LIST,
      sort: { createdAt: -1 },
    },
  );
});

// patterns cretaed by a user
Meteor.publish(
  'userPatterns',
  function ({
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
    skip = 0,
    limit,
    userId,
  }) {
    // this needs to return the same number of patterns as the getPatternCount method, for pagination
    check(filterIsTwistNeutral, Match.Maybe(Boolean));
    check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
    check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
    check(filterWillRepeat, Match.Maybe(Boolean));
    check(limit, positiveIntegerCheck);
    check(skip, positiveIntegerCheck);
    check(userId, nonEmptyStringCheck);

    const self = this;

    const myCursor = Patterns.find(
      {
        $and: [
          getPatternFilter({
            filterIsTwistNeutral,
            filterMaxTablets,
            filterMinTablets,
            filterWillRepeat,
          }),
          { createdBy: userId },
          getPatternPermissionQuery(this.userId),
        ],
      },
      {
        fields: patternsFields,
        sort: { nameSort: 1 },
        skip,
        limit,
      },
    );

    // this is a hack to differentiate paginated list data from (for example) patterns loaded as part of Set data. Stopping the patternsById subscription does not remove the patterns from Minimongo and I can't work out why, so the client needs a way to filter data for pages.
    myCursor.forEach((pattern) => {
      // eslint-disable-next-line no-param-reassign
      pattern.pagesData = true;
      self.added('patterns', pattern._id, pattern);
    });

    self.ready();
  },
);

// //////////////////////////
// Pattern preview graphics

Meteor.publish('patternPreviews', async function ({ patternIds }) {
  // we previously explicitly returned nothing when user was not logged in
  // this is so we can test behaviour when user is not logged in: PublicationCollector passes in undefined userId, and find() is inconsistent between Meteor and MongoDB on undefined
  check(patternIds, [String]);

  if (patternIds.length === 0) {
    this.ready();
    return;
  }

  const self = this;

  // find the patterns the user can see
  // and that are in the array passed in
  const patterns = await Patterns.find(
    {
      $and: [
        { _id: { $in: patternIds } },
        getPatternPermissionQuery(this.userId),
      ],
    },
    {
      fields: {},
    },
  ).fetchAsync();

  // extract their _ids as an array
  const targetPatternIds = patterns.map((pattern) => pattern._id);

  // find the previews for those patterns
  const previews = await PatternPreviews.find({
    patternId: { $in: targetPatternIds },
  }).fetchAsync();

  previews.forEach((PatternPreview) => {
    // eslint-disable-line no-param-reassign
    PatternPreview.rootAddress = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com`; // allows us to switch environments for test
    self.added('patternPreviews', PatternPreview._id, PatternPreview);
  });

  self.ready();
});

// Public information about particular users
Meteor.publish('users', function (userIds) {
  if (userIds.length === 0) {
    this.ready();
    return;
  }

  check(userIds, [String]);

  if (userIds.length === 0) {
    this.ready();
    return;
  }

  // return those users with public color books or patterns
  // whose ids are in the array passed in
  return Meteor.users.find(
    {
      $and: [getUserPermissionQuery(this.userId), { _id: { $in: userIds } }],
    },
    {
      fields: USER_FIELDS,
    },
  );
});

// preview list for users
// displayed on Home page
Meteor.publish('allUsersPreview', function () {
  return Meteor.users.find(getUserPermissionQuery(this.userId), {
    fields: USER_FIELDS,
    limit: ITEMS_PER_PREVIEW_LIST,
    sort: { nameSort: 1 },
  });
});

// Pattern Images that have been uploaded by the pattern's owner
// Show images for a particular pattern
Meteor.publish('patternImages', async function (patternId) {
  check(patternId, nonEmptyStringCheck);

  const pattern = await Patterns.findOneAsync(
    { _id: patternId },
    { fields: { createdBy: 1, isPublic: 1 } },
  );

  if (!pattern) {
    this.ready();
    return;
  }

  if (!pattern.isPublic && pattern.createdBy !== this.userId) {
    this.ready();
    return;
  }

  return PatternImages.find({ patternId });
});

// all tags are public
Meteor.publish('tags', () => Tags.find());

// all FAQs are public
Meteor.publish('faq', () => FAQ.find());

// the user can see their own sets and any sets containing public patterns
// all visible set belonging to one user
// sets don't have a lot of fields or data, and none of it is sensitive, so publish all fields.
Meteor.publish('setsForUser', function (userId) {
  check(userId, Match.Maybe(nonEmptyStringCheck));

  if (!userId) {
    return;
  }

  return Sets.find({
    $and: [{ createdBy: userId }, getSetPermissionQuery(this.userId)],
  });
});

// an individual set
Meteor.publish('set', function (_id) {
  check(_id, nonEmptyStringCheck);

  return Sets.find({
    $and: [{ _id }, getSetPermissionQuery(this.userId)],
  });
});

// //////////////////////////
// Roles

Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }

  this.ready();
});
