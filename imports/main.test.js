// These are the default Meteor app tests

import assert from 'assert';

describe('twisted-threads-2', () => {
	it('package.json has correct name', async () => {
		const { name } = await import('../package.json');
		assert.strictEqual(name, 'twisted-threads-2');
	});

	if (Meteor.isClient) {
		it('client is not server', () => {
			assert.strictEqual(Meteor.isServer, false);
		});
	}

	if (Meteor.isServer) {
		it('server is not client', () => {
			assert.strictEqual(Meteor.isClient, false);
		});
	}
});
