/* eslint-env mocha */

// the basic examples don't show how to catch async failure cases without an error: 'UnhandledPromiseRejectionWarning: AssertionError:'
// it seems publicationcollector is async
// I adapted a solution from https://staxmanade.com/2015/11/testing-asyncronous-code-with-mochajs-and-es7-async-await/

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from './00_setup';
import { assert } from 'chai';
import { Roles } from 'meteor/roles';
import '../../imports/server/modules/publications';
import {
  ColorBooks,
  PatternImages,
  Patterns,
  PatternPreviews,
  Sets,
} from '../../imports/modules/collection';
import {
  ALLOWED_ITEMS_PER_PAGE,
  ITEMS_PER_PREVIEW_LIST,
} from '../../imports/modules/parameters';
import {
  createManyUsers,
  logOutButLeaveUser,
  stubNoUser,
  stubOtherUser,
  stubUser,
  unwrapUser,
  createUser,
} from './mockUser';
import {
  createPattern,
  createColorBook,
  createSet,
  createPatternPreview,
  createPatternImage,
  defaultPatternData,
  defaultColorBookData,
  defaultSetData,
} from './testData';
import createManyPatterns from './createManyPatterns';

// fields that should be published for patterns list
const patternsFields = [
  '_id',
  'createdAt',
  'createdBy',
  'description',
  'holes',
  'isTwistNeutral',
  'isPublic',
  'name',
  'nameSort',
  'numberOfRows',
  'numberOfTablets',
  'patternType',
  'tags',
  'willRepeat',
];

// pattern fields that are generated programmatically so cannot be checked from default pattern data
const excludedPatternFields = ['_id', 'createdAt', 'createdBy'];

// fields that should be published for individual pattern
const patternFields = patternsFields.concat([
  'holeHandedness',
  'includeInTwist',
  'orientations',
  'palette',
  'patternDesign',
  'previewOrientation',
  'threading',
  'threadingNotes',
  'weavingNotes',
  'weftColor',
]);

if (Meteor.isServer) {
  // eslint-disable-next-line func-names
  describe('test publications', function () {
    this.timeout(15000);
    beforeEach(async () => {
      unwrapUser(); // Clean up any existing stubs
      await resetDatabase();

      this.currentUser = await stubUser();

      this.pattern1 = await createPattern({
        name: 'Pattern 1',
        createdBy: this.currentUser._id,
      });
      this.pattern2 = await createPattern({
        name: 'Pattern 2',
        createdBy: this.currentUser._id,
      });
      this.colorBook = await createColorBook({
        name: 'My book',
        createdBy: this.currentUser._id,
      });

      // pattern previews
      await createPatternPreview({ patternId: this.pattern1._id });
      await createPatternPreview({ patternId: this.pattern2._id });

      // pattern images
      await createPatternImage({ patternId: this.pattern1._id });
      await createPatternImage({ patternId: this.pattern2._id });

      // put two patterns in a set
      this.set1 = await createSet({
        createdBy: this.currentUser._id,
        patterns: [this.pattern1._id, this.pattern2._id],
      });

      this.set2 = await createSet({
        createdBy: this.currentUser._id,
        patterns: [this.pattern1._id, this.pattern2._id],
      });

      // this would be done automatically if we used the method
      await Patterns.updateAsync(
        { _id: { $in: [this.pattern1._id, this.pattern2._id] } },
        { $set: { sets: [this.set1._id, this.set2._id] } },
        { multi: true },
      );
    });
    afterEach(() => {
      unwrapUser();
    });
    describe('publish patterns', () => {
      it('should publish nothing if user not logged in', async () => {
        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish public documents if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        await Patterns.updateAsync(
          { _id: this.pattern1._id },
          { $set: { isPublic: true } },
        );

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
      it('should publish 2 documents if the user is logged in', async () => {
        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 2);

        // check the published pattern
        const testPattern = result[0];

        assert.equal(testPattern.createdBy, this.currentUser._id);

        // the required fields are published
        patternsFields.forEach((fieldName) => {
          assert.notEqual(testPattern[fieldName], undefined);
          // don't test the fields that are created programmatically
          if (excludedPatternFields.indexOf(fieldName) === -1) {
            // the values are correct
            // use stringify to compare arrays and objects
            assert.equal(
              JSON.stringify(testPattern[fieldName]),
              JSON.stringify(defaultPatternData[fieldName]),
            );
          }
        });

        // no extra fields are published
        Object.keys(testPattern).forEach((fieldName) => {
          assert.include(patternsFields, fieldName);
        });
      });
      it('should publish 0 documents if a different user is logged in', async () => {
        // create a different user
        const otherUser = await stubOtherUser();

        const collector = new PublicationCollector({
          userId: otherUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
    });
    describe('publish single pattern', () => {
      it('should publish nothing if user not logged in', async () => {
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('pattern', this.pattern1._id, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish public document if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        await Patterns.updateAsync(
          { _id: this.pattern1._id },
          { $set: { isPublic: true } },
        );

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('pattern', this.pattern1._id, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
      it('should publish the document if the user is logged in', async () => {
        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect('pattern', this.pattern1._id, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 1);

        // check the published pattern
        const testPattern = result[0];

        assert.equal(testPattern.createdBy, this.currentUser._id);

        // the required fields are published
        patternFields.forEach((fieldName) => {
          assert.notEqual(testPattern[fieldName], undefined);
          // don't test the fields that are created programmatically

          if (excludedPatternFields.indexOf(fieldName) === -1) {
            // the values are correct
            // use stringify to compare arrays and objects
            assert.equal(
              JSON.stringify(testPattern[fieldName]),
              JSON.stringify(defaultPatternData[fieldName]),
            );
          }
        });

        // no extra fields are published
        Object.keys(testPattern).forEach((fieldName) => {
          assert.include(patternFields, fieldName);
        });
      });
      it('should publish nothing if a different user is logged in', async () => {
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect('pattern', this.pattern1._id, (collections) => {
            resolve(collections.patterns.length);
          });
        });

        const result = await testPromise;

        assert.equal(result, 0);
      });
      it('should publish all patterns if the user has serviceUser role', async () => {
        unwrapUser();
        stubUser();

        // give user serviceUser role
        await Roles.createRoleAsync('serviceUser', { unlessExists: true });
        await Roles.addUsersToRolesAsync([this.currentUser._id], ['serviceUser']);

        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect('pattern', this.pattern1._id, (collections) => {
            resolve(collections.patterns.length);
          });
        });

        const result = await testPromise;

        assert.equal(result, 1);
      });
    });
    // /////////////////////////
    describe('publish patternsById', () => {
      it('should publish nothing if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternsById',
            [this.pattern1._id, this.pattern2._id],
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish public documents if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        await Patterns.updateAsync(
          { _id: this.pattern1._id },
          { $set: { isPublic: true } },
        );

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternsById',
            [this.pattern1._id, this.pattern2._id],
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
      it('should publish 2 documents if the user is logged in', async () => {
        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternsById',
            [this.pattern1._id, this.pattern2._id],
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 2);
      });
      it('should publish 0 documents if no valid ids specified', async () => {
        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('patternsById', ['xxx'], (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish 0 documents if a different user is logged in', async () => {
        // log in a different user
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternsById',
            [this.pattern1._id, this.pattern2._id],
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
    });
    // /////////////////////////
    describe('publish allPatternsPreview', () => {
      it('should publish only public patterns if user not logged in', async () => {
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('allPatternsPreview', (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const expectedNames = publicMyPatternNames
          .concat(publicOtherPatternNames)
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);

        const result = await testPromise;

        // these should be the first patterns alphabetically
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
      it('should publish private and public patterns if the user is logged in', async () => {
        const {
          publicMyPatternNames,
          privateMyPatternNames,
          publicOtherPatternNames,
        } = await createManyPatterns();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('allPatternsPreview', (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const allPatterns = publicMyPatternNames
          .concat(privateMyPatternNames)
          .concat(publicOtherPatternNames);

        const expectedNames = allPatterns
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);
        const result = await testPromise;

        // these should be the first patterns alphabetically
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
      it('should publish only public patterns if a different user is logged in', async () => {
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        // log in a different user
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('allPatternsPreview', (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const allPatterns = publicMyPatternNames.concat(
          publicOtherPatternNames,
        );

        const expectedNames = allPatterns
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);

        const result = await testPromise;

        // these should be the first patterns alphabetically
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
    });
    // /////////////////////////
    describe('publish myPatternsPreview', () => {
      it('should publish nothing if user not logged in', async () => {
        await createManyPatterns();

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('myPatternsPreview', {}, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const result = await testPromise;

        assert.equal(result, undefined); // this.ready() returns undefined
      });
      it("should publish the user's patterns if the user is logged in", async () => {
        const { publicMyPatternNames, privateMyPatternNames } =
          await createManyPatterns();

        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'myPatternsPreview',
            { limit: 100 },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const allPatterns = publicMyPatternNames.concat(privateMyPatternNames);
        const expectedNames = allPatterns
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);
        const result = await testPromise;

        // these should be the first patterns alphabetically
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
      it('should publish nothing if a different user is logged in', async () => {
        await createManyPatterns();

        // log in a different user
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('myPatternsPreview', {}, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const result = await testPromise;

        assert.equal(result, undefined); // this.ready() returns undefined
      });
    });
    // /////////////////////////
    describe('publish newPatterns', () => {
      it('should publish only public patterns if user not logged in', async () => {
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'newPatterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const allPatterns = publicMyPatternNames.concat(
          publicOtherPatternNames,
        );

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();
        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(0, ALLOWED_ITEMS_PER_PAGE[0]);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
      });
      it("should publish public and user's own patterns if user is logged in", async () => {
        const {
          publicMyPatternNames,
          privateMyPatternNames,
          publicOtherPatternNames,
        } = await createManyPatterns();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'newPatterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const allPatterns = publicMyPatternNames
          .concat(publicOtherPatternNames)
          .concat(privateMyPatternNames);

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();
        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(0, ALLOWED_ITEMS_PER_PAGE[0]);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
      });
      it('should respect skip', async () => {
        const {
          publicMyPatternNames,
          privateMyPatternNames,
          publicOtherPatternNames,
        } = await createManyPatterns();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'newPatterns',
            {
              limit: ALLOWED_ITEMS_PER_PAGE[0],
              skip: ALLOWED_ITEMS_PER_PAGE[0],
            },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const allPatterns = publicMyPatternNames
          .concat(publicOtherPatternNames)
          .concat(privateMyPatternNames);

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();
        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(ALLOWED_ITEMS_PER_PAGE[0], ALLOWED_ITEMS_PER_PAGE[0] * 2);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
      });
      it('should publish only public patterns if a different user is logged in', async () => {
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        // make sure publications know there is no user
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'newPatterns',
            { limit: ALLOWED_ITEMS_PER_PAGE[0] },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const allPatterns = publicMyPatternNames.concat(
          publicOtherPatternNames,
        );

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();
        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(0, ALLOWED_ITEMS_PER_PAGE[0]);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
      });
    });
    // /////////////////////////
    describe('publish newPatternsPreview', () => {
      it('should publish only public patterns if user not logged in', async () => {
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('newPatternsPreview', {}, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const allPatterns = publicMyPatternNames.concat(
          publicOtherPatternNames,
        );

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();
        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(0, ITEMS_PER_PREVIEW_LIST);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
      it('should publish only public patterns if user is logged in', async () => {
        // the user's private patterns are not shown to avoid duplication in Recents with the user's new work
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('newPatternsPreview', {}, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const allPatterns = publicMyPatternNames.concat(
          publicOtherPatternNames,
        );

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();

        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(0, ITEMS_PER_PREVIEW_LIST);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
      it('should publish only public patterns if a different user is logged in', async () => {
        const { publicMyPatternNames, publicOtherPatternNames } =
          await createManyPatterns();

        // make sure publications know there is a user
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({});

        const testPromise = new Promise((resolve) => {
          collector.collect('newPatternsPreview', {}, (collections) => {
            resolve(collections.patterns || []);
          });
        });

        const allPatterns = publicMyPatternNames.concat(
          publicOtherPatternNames,
        );

        const allPatternsObjs = await Patterns.find(
          { name: { $in: allPatterns } },
          {
            sort: { createdAt: -1 },
            fields: { nameSort: 1, createdAt: 1 },
          },
        ).fetchAsync();
        const expectedNames = allPatternsObjs
          .map((pattern) => pattern.nameSort)
          .slice(0, ITEMS_PER_PREVIEW_LIST);

        const result = await testPromise;

        // these should be the first patterns by createdAt
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
    });
    // /////////////////////////
    describe('publish userPatterns', () => {
      it("should publish all the user's patterns if the user is logged in", async () => {
        const { publicMyPatternNames, privateMyPatternNames } =
          await createManyPatterns();

        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'userPatterns',
            {
              limit: ALLOWED_ITEMS_PER_PAGE[0],
              userId: this.currentUser._id,
            },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const allPatterns = publicMyPatternNames.concat(privateMyPatternNames);
        const expectedNames = allPatterns
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);
        const result = await testPromise;

        // these should be the first patterns alphabetically
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
      });
      it('should publish only public patterns if the user is not logged in', async () => {
        const { publicMyPatternNames } = await createManyPatterns();
        const userId = this.currentUser._id;

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'userPatterns',
            {
              limit: ALLOWED_ITEMS_PER_PAGE[0],
              userId,
            },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const expectedNames = publicMyPatternNames
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);
        const result = await testPromise;

        // these should be the first patterns alphabetically
        result.forEach((pattern) => {
          assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
        });

        assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
      });
    });
    // /////////////////////////
    describe('publish color books', () => {
      it('should publish nothing if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('colorBooks', (collections) => {
            resolve(collections.colorBooks || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish the document if the user is logged in', async () => {
        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'colorBooks',
            this.currentUser._id,
            (collections) => {
              resolve(collections.colorBooks || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 1);

        // all fields should be published
        // TODO update this when color books can be made private / public
      });
      it('should publish 0 documents if a different user is logged in', async () => {
        // log in a different user
        unwrapUser();
        stubUser();

        const collector = new PublicationCollector({ userId: 'xxx' });

        const testPromise = new Promise((resolve) => {
          collector.collect('colorBooks', (collections) => {
            resolve(collections.colorBooks.length);
          });
        });

        const result = await testPromise;

        assert.equal(result, 0);
      });
      it('should publish public documents if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        await ColorBooks.updateAsync(
          { _id: this.colorBook._id },
          { $set: { isPublic: true } },
        );

        await ColorBooks.findOneAsync({ _id: this.colorBook._id });

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('colorBooks', (collections) => {
            resolve(collections.colorBooks || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
      it('should publish public documents if a different user is logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubUser();

        await ColorBooks.updateAsync(
          { _id: this.colorBook._id },
          { $set: { isPublic: true } },
        );

        await ColorBooks.findOneAsync({ _id: this.colorBook._id });

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('colorBooks', (collections) => {
            resolve(collections.colorBooks || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
    });
    // /////////////////////////
    describe('publish pattern previews', () => {
      it('should publish nothing if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternPreviews',
            { patternIds: [this.pattern1._id] },
            (collections) => {
              resolve(collections.patternPreviews || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result, undefined);
      });
      it('should publish preview for public pattern if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        await Patterns.updateAsync(
          { _id: this.pattern1._id },
          { $set: { isPublic: true } },
        );

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternPreviews',
            { patternIds: [this.pattern1._id] },
            (collections) => {
              resolve(collections.patternPreviews || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
        assert.equal(result[0].patternId, this.pattern1._id);
      });
      it('should publish preview if user is logged in', async () => {
        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternPreviews',
            { patternIds: [this.pattern1._id, this.pattern2._id] },
            (collections) => {
              resolve(collections.patternPreviews || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 2);
      });
    });
    // /////////////////////////
    describe('publish users', () => {
      it('should publish nothing if user not logged in and no public patterns', async () => {
        const userId = this.currentUser._id;

        // make sure publications know there is no user
        logOutButLeaveUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('users', [userId], (collections) => {
            resolve(collections.users || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish user if user not logged in and user has a public pattern', async () => {
        const userId = this.currentUser._id;

        // make sure publications know there is no user
        logOutButLeaveUser();

        await Meteor.users.updateAsync(
          { _id: userId },
          { $set: { publicPatternsCount: 1 } },
        );

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('users', [userId], (collections) => {
            resolve(collections.users || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
      it('should publish user if user not logged in and user has a public color book', async () => {
        const userId = this.currentUser._id;

        // make sure publications know there is no user
        logOutButLeaveUser();

        await Meteor.users.updateAsync(
          { _id: userId },
          { $set: { publicColorBooksCount: 1 } },
        );

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('users', [userId], (collections) => {
            resolve(collections.users || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
      it('should publish nothing if other user logged in and user has no public patterns', async () => {
        const userId = this.currentUser._id;

        // log in other user
        stubOtherUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('users', [userId], (collections) => {
            resolve(collections.users || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
    });
    // /////////////////////////
    describe('publish allUsersPreview', () => {
      it('should publish users with public patterns if user not logged in', async () => {
        const { publicPatternUsernames } = createManyUsers();

        // make sure publications know there is no user
        logOutButLeaveUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('allUsersPreview', (collections) => {
            resolve(collections.users || []);
          });
        });
        const expectedUsernames = publicPatternUsernames
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);
        const result = await testPromise;

        // these should be the first usernames alphabetically
        result.forEach((user) => {
          assert.notEqual(expectedUsernames.indexOf(user.username), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
      it('should publish users with public patterns if user is logged in', async () => {
        const { publicPatternUsernames } = createManyUsers();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('allUsersPreview', (collections) => {
            resolve(collections.users || []);
          });
        });
        const expectedUsernames = publicPatternUsernames
          .sort()
          .slice(0, ITEMS_PER_PREVIEW_LIST);
        const result = await testPromise;

        // these should be the first usernames alphabetically
        result.forEach((user) => {
          assert.notEqual(expectedUsernames.indexOf(user.username), -1);
        });

        assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
      });
    });
    // /////////////////////////
    describe('publish pattern images', () => {
      it('should publish nothing if user not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternImages',
            this.pattern1._id,
            (collections) => {
              resolve(collections.patternImages || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result, undefined);
      });
      it('should publish the preview if user is logged in', async () => {
        const collector = new PublicationCollector({
          userId: this.currentUser._id,
        });

        const testPromise = new Promise((resolve) => {
          collector.collect(
            'patternImages',
            this.pattern1._id,
            (collections) => {
              resolve(collections.patternImages || []);
            },
          );
        });

        const result = await testPromise;

        assert.equal(result.length, 1);
      });
    });
    // /////////////////////////
    describe('publish setsForUser', () => {
      it('should publish 0 sets if user not logged in and no public sets exist', async () => {
        // make sure publications know there is no user
        const userId = this.currentUser._id;

        unwrapUser();
        stubNoUser();

        // if no public patterns in set, publish nothing
        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('setsForUser', userId, (collections) => {
            resolve(collections.sets || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 0);
      });
      it('should publish 2 sets if user not logged in and there are 2 public sets', async () => {
        // make sure publications know there is no user
        const userId = this.currentUser._id;

        // set 1 pattern in set to public
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync(userId, ['verified']);

        await Meteor.callAsync('pattern.edit', {
          _id: this.pattern1._id,
          data: {
            type: 'editIsPublic',
            isPublic: true,
          },
        });

        unwrapUser();
        stubNoUser();

        // wait before rechecking the database
        await new Promise((resolve) => setTimeout(resolve, 10));
        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('setsForUser', userId, (collections) => {
            resolve(collections.sets || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 2); // 2 sets published

        // two patterns are listed as belonging to the first set
        const patternsInSet = result[0].patterns;
        assert.equal(patternsInSet.length, 2);

        // only the public pattern is published to the logged out user
        const collector2 = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise2 = new Promise((resolve) => {
          collector2.collect(
            'patterns',
            { skip: 0, limit: 10 },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result2 = await testPromise2;

        assert.equal(result2.length, 1); // 1 pattern is published
        assert.equal(result2[0]._id, this.pattern1._id, 1); // it is the public pattern
      });
      it('should publish 2 sets if another user is logged in and there are 2 public sets', async () => {
        // make sure publications know there is no user
        const userId = this.currentUser._id;

        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync(userId, ['verified']);

        // set 1 pattern in set to public
        await Meteor.callAsync('pattern.edit', {
          _id: this.pattern1._id,
          data: {
            type: 'editIsPublic',
            isPublic: true,
          },
        });

        // log in other user
        stubOtherUser();

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('setsForUser', userId, (collections) => {
            resolve(collections.sets || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 2); // 2 sets published

        // two patterns are listed as belonging to the first set
        const patternsInSet = result[0].patterns;
        assert.equal(patternsInSet.length, 2);

        // only the public pattern is published to the logged out user
        const collector2 = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise2 = new Promise((resolve) => {
          collector2.collect(
            'patterns',
            { skip: 0, limit: 10 },
            (collections) => {
              resolve(collections.patterns || []);
            },
          );
        });

        const result2 = await testPromise2;

        assert.equal(result2.length, 1); // 1 pattern is published
        assert.equal(result2[0]._id, this.pattern1._id, 1); // it is the public pattern
      });
      it('should publish 2 sets if user logged in and their sets are private', async () => {
        const userId = this.currentUser._id;

        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('setsForUser', userId, (collections) => {
            resolve(collections.sets || []);
          });
        });

        const result = await testPromise;

        assert.equal(result.length, 2);
      });
    });
    // /////////////////////////
    describe('publish weavingBackwardsBackgroundColor for user', () => {
      it('should publish a value if the user is logged in', async () => {
        // make sure publications know there is no user
        const userId = this.currentUser._id;

        // if no public patterns in set, publish nothing
        const collector = new PublicationCollector({ userId: this.currentUser._id });

        const testPromise = new Promise((resolve) => {
          collector.collect('users', [userId], (collections) => {
            resolve(collections.users || []);
          });
        });

        const result = await testPromise;

        assert.equal(result[0].weavingBackwardsBackgroundColor, '#aabbcc');
      });
    });
    // /////////////////////////
    describe('search publications', () => {
      describe('search.patterns', () => {
        it('should publish nothing if no search term provided', async () => {
          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.patterns', '', 20, (collections) => {
              resolve(collections);
            });
          });

          const result = await testPromise;

          assert.equal(result.searchPatterns, undefined);
        });

        it('should publish only public patterns if user not logged in', async () => {
          unwrapUser();
          stubNoUser();

          await Patterns.updateAsync(
            { _id: this.pattern1._id },
            { $set: { isPublic: true, name: 'TestPattern' } },
          );

          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.patterns', 'TestPattern', 20, (collections) => {
              resolve(collections.searchPatterns);
            });
          });

          const result = await testPromise;

          assert.equal(result.length, 1);
          assert.equal(result[0].name, 'TestPattern');
          assert.property(result[0], 'username', 'should include username field');
        });

        it('should publish public and own private patterns if user logged in', async () => {
          await Patterns.updateAsync(
            { _id: this.pattern1._id },
            { $set: { isPublic: true, name: 'PublicPattern' } },
          );

          await Patterns.updateAsync(
            { _id: this.pattern2._id },
            { $set: { isPublic: false, name: 'PrivatePattern' } },
          );

          const collector = new PublicationCollector({
            userId: this.currentUser._id,
          });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.patterns', 'Pattern', 20, (collections) => {
              resolve(collections.searchPatterns);
            });
          });

          const result = await testPromise;

          assert.equal(result.length, 2);
          result.forEach((pattern) => {
            assert.property(pattern, 'username', 'should include username field');
          });
        });

        it('should respect limit parameter', async () => {
          // Create multiple patterns
          for (let i = 0; i < 5; i++) {
            await createPattern({
              name: `SearchTest${i}`,
              isPublic: true,
              createdBy: Meteor.userId(),
            });
          }

          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.patterns', 'SearchTest', 3, (collections) => {
              resolve(collections.searchPatterns);
            });
          });

          const result = await testPromise;

          assert.isAtMost(result.length, 3);
        });
      });

      describe('search.users', () => {
        it('should publish nothing if no search term provided', async () => {
          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.users', '', 20, (collections) => {
              resolve(collections);
            });
          });

          const result = await testPromise;

          assert.equal(result.searchUsers, undefined);
        });

        it('should publish matching users', async () => {
          const currentUser = await Meteor.users.findOneAsync({ _id: Meteor.userId() });
          
          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.users', currentUser.username, 20, (collections) => {
              resolve(collections.searchUsers);
            });
          });

          const result = await testPromise;

          assert.isAtLeast(result.length, 1);
          assert.equal(result[0].username, currentUser.username);
        });

        it('should respect limit parameter', async () => {
          // Create multiple users
          for (let i = 0; i < 5; i++) {
            await createUser({
              username: `searchuser${i}`,
            });
          }

          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.users', 'searchuser', 3, (collections) => {
              resolve(collections.searchUsers);
            });
          });

          const result = await testPromise;

          assert.isAtMost(result.length, 3);
        });
      });

      describe('search.sets', () => {
        it('should publish nothing if no search term provided', async () => {
          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.sets', '', 20, (collections) => {
              resolve(collections);
            });
          });

          const result = await testPromise;

          assert.equal(result.searchSets, undefined);
        });

        it('should publish only public sets if user not logged in', async () => {
          unwrapUser();
          stubNoUser();

          // Make pattern public so set becomes public
          await Roles.createRoleAsync('verified', { unlessExists: true });
          await Roles.addUsersToRolesAsync([this.currentUser._id], ['verified']);

          await Meteor.callAsync('pattern.edit', {
            _id: this.pattern1._id,
            data: {
              type: 'editIsPublic',
              isPublic: true,
            },
          });

          await Sets.updateAsync(
            { _id: this.set1._id },
            { $set: { name: 'TestSet' } },
          );

          unwrapUser();
          stubNoUser();

          const collector = new PublicationCollector({ userId: this.currentUser._id });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.sets', 'TestSet', 20, (collections) => {
              resolve(collections.searchSets);
            });
          });

          const result = await testPromise;

          assert.isAtLeast(result.length, 1);
          result.forEach((set) => {
            assert.property(set, 'username', 'should include username field');
          });
        });

        it('should publish public and own private sets if user logged in', async () => {
          await Sets.updateAsync(
            { _id: this.set1._id },
            { $set: { name: 'MySet1' } },
          );

          await Sets.updateAsync(
            { _id: this.set2._id },
            { $set: { name: 'MySet2' } },
          );

          const collector = new PublicationCollector({
            userId: this.currentUser._id,
          });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.sets', 'MySet', 20, (collections) => {
              resolve(collections.searchSets);
            });
          });

          const result = await testPromise;

          assert.equal(result.length, 2);
          result.forEach((set) => {
            assert.property(set, 'username', 'should include username field');
          });
        });

        it('should respect limit parameter', async () => {
          // Create multiple sets
          for (let i = 0; i < 5; i++) {
            await createSet({
              name: `SearchSetTest${i}`,
              createdBy: Meteor.userId(),
            });
          }

          const collector = new PublicationCollector({
            userId: this.currentUser._id,
          });

          const testPromise = new Promise((resolve) => {
            collector.collect('search.sets', 'SearchSetTest', 3, (collections) => {
              resolve(collections.searchSets);
            });
          });

          const result = await testPromise;

          assert.isAtMost(result.length, 3);
        });
      });
    });
    // this is not secure information and will be visible to anybody
  });
}
