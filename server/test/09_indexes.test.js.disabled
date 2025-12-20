/* eslint-env mocha */

import { assert } from 'chai';
import {
  Patterns,
  Sets,
  Tags,
  ColorBooks,
  FAQ,
  ActionsLog,
  PatternPreviews,
  PatternImages,
} from '../../imports/modules/collection';

if (Meteor.isServer) {
  describe('database indexes', function () {
    this.timeout(10000);

    it('should include expected btree indexes for key collections', async function () {
      const patternsInfo = await Patterns.rawCollection().indexInformation();
      const setsInfo = await Sets.rawCollection().indexInformation();
      const tagsInfo = await Tags.rawCollection().indexInformation();
      const faqInfo = await FAQ.rawCollection().indexInformation();
      const colorBooksInfo = await ColorBooks.rawCollection().indexInformation();
      const actionsInfo = await ActionsLog.rawCollection().indexInformation();
      const previewsInfo = await PatternPreviews.rawCollection().indexInformation();
      const imagesInfo = await PatternImages.rawCollection().indexInformation();

      // check keys exist by index name containing the field name
      const hasIndex = (info, fieldName) => Object.keys(info).some(k => k.indexOf(fieldName) !== -1);

      assert.isTrue(hasIndex(patternsInfo, 'createdAt'), 'Patterns should have createdAt index');
      assert.isTrue(hasIndex(patternsInfo, 'createdBy'), 'Patterns should have createdBy index');
      assert.isTrue(hasIndex(patternsInfo, 'tags') || hasIndex(patternsInfo, 'tags_'), 'Patterns should have tags index');

      assert.isTrue(hasIndex(setsInfo, 'nameSort'), 'Sets should have nameSort index');
      assert.isTrue(hasIndex(setsInfo, 'createdBy') || hasIndex(setsInfo, 'createdAt'), 'Sets should have createdBy/createdAt index');

      assert.isTrue(hasIndex(tagsInfo, 'name'), 'Tags should have name index');
      assert.isTrue(hasIndex(faqInfo, 'question'), 'FAQ should have question index');
      assert.isTrue(hasIndex(colorBooksInfo, 'nameSort'), 'ColorBooks should have nameSort index');
      assert.isTrue(hasIndex(actionsInfo, 'userId'), 'ActionsLog should have userId index');
      assert.isTrue(hasIndex(previewsInfo, 'patternId'), 'PatternPreviews should have patternId index');
      assert.isTrue(hasIndex(imagesInfo, 'patternId') || hasIndex(imagesInfo, 'createdAt'), 'PatternImages should have patternId/createdAt index');
    });
  });
}
