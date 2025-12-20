/* eslint-env mocha */

import { assert } from 'chai';
import { Patterns, Sets, Tags } from '../../imports/modules/collection';

if (Meteor.isServer) {
  describe('automatic index creation', function () {
    this.timeout(20000);

    function sleep(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }

    async function waitForIndex(collection, fieldName, timeout = 10000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const info = await collection.rawCollection().indexInformation();
        const has = Object.keys(info).some((k) => k.indexOf(fieldName) !== -1);
        if (has) return true;
        // wait and retry
        // eslint-disable-next-line no-await-in-loop
        await sleep(500);
      }
      return false;
    }

    it('creates expected indexes within timeout', async function () {
      const ok = await waitForIndex(Patterns, 'createdAt', 10000);
      assert.isTrue(ok, 'Patterns createdAt index was created');

      const ok2 = await waitForIndex(Sets, 'nameSort', 10000);
      assert.isTrue(ok2, 'Sets nameSort index was created');

      const ok3 = await waitForIndex(Tags, 'name', 10000);
      assert.isTrue(ok3, 'Tags name index was created');
    });
  });
}
