/* eslint-env mocha */

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ActionsLog } from '../../imports/modules/collection';
import '../methods/auth';
import { stubUser, unwrapUser, callMethodWithUser } from './mockUser';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

const moment = require('moment');

if (Meteor.isServer) {
  describe('test ActionsLog throttling', function testActionsLogThrottling() {
    beforeEach(async () => {
      unwrapUser();
      await resetDatabase();
      await ensureAllRolesExist();
    });

    afterEach(() => {
      unwrapUser();
    });

    // Helper function to create actions log with specific timestamps
    async function createActionsLogWithTimestamps(
      userId,
      username,
      action,
      timestamps,
    ) {
      await ActionsLog.insertAsync({
        userId,
        username,
        verificationEmailSent:
          action === 'verificationEmailSent' ? timestamps : [],
        imageUploaded: action === 'imageUploaded' ? timestamps : [],
        locked: false,
      });
    }

    describe('normal usage - no throttling', () => {
      it('allows the first action when no log exists', async () => {
        const currentUser = await stubUser();
        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        const result = await callMethodWithUser(
          currentUser._id,
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);

        const log = await ActionsLog.findOneAsync({ userId: currentUser._id });
        expect(log.verificationEmailSent).to.have.lengthOf(1);
      });

      it('allows 10 actions spread over 10+ seconds', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 9 prior actions, each 1.1 seconds apart (total span ~10 seconds)
        // The 10th action will be added by the method call
        for (let i = 9; i >= 1; i -= 1) {
          timestamps.push(
            now
              .clone()
              .subtract(i * 1.1, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // This should succeed as the actions are spread out
        const result = await callMethodWithUser(
          currentUser._id,
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);
      });
    });

    describe('rapid actions - throttling triggers', () => {
      it('throws error when 5 actions occur in < 2 seconds and user retries within 5 minutes', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 10 actions with last 5 in < 2 seconds
        // Actions 0-4: each 0.3 seconds apart (< 2 seconds total)
        // Actions 5-9: spread out to make total span > 20 seconds (to avoid account lock)
        for (let i = 0; i < 5; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(i * 0.3, 'seconds')
              .toDate(),
          );
        }
        for (let i = 5; i < 10; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(20 + i, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should throw error as we're within 5 minutes
        async function expectedError() {
          await callMethodWithUser(
            currentUser._id,
            'auth.sendVerificationEmail',
            currentUser._id,
          );
        }

        await expect(expectedError()).to.be.rejectedWith('too-many-requests');
      });

      it('allows retry after 5 minutes when only recent 5 actions were rapid', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 9 actions with last 5 in < 2 seconds, but 5+ minutes ago
        // Actions 0-4: each 0.3 seconds apart, starting 6 minutes ago
        for (let i = 0; i < 5; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(6, 'minutes')
              .subtract(i * 0.3, 'seconds')
              .toDate(),
          );
        }
        // Actions 5-9: spread out before that
        for (let i = 5; i < 10; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(6, 'minutes')
              .subtract(10 + i, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should succeed as it's been over 5 minutes
        const result = await callMethodWithUser(
          currentUser._id,
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);
      });

      it('throws error requiring 30 min wait when last 10 actions show pattern of automation', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 10 actions showing automation pattern:
        // Action 0: very recent (to trigger throttling check)
        // Actions 1-4: rapid burst with action 0 (< 2 seconds total)
        // Actions 5-9: another rapid burst 6 minutes before action 4 (< 2 seconds)
        // Total span > 20s to avoid immediate lock, but shows automation pattern

        // Most recent burst (actions 0-4) - right now, each 0.3s apart
        for (let i = 0; i < 5; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(i * 0.3, 'seconds')
              .toDate(),
          );
        }

        // Previous burst (actions 5-9) - 6 minutes ago, also each 0.3s apart
        for (let i = 0; i < 5; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(6, 'minutes')
              .subtract(i * 0.3, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should throw error requiring 30 minute wait
        async function expectedError() {
          await callMethodWithUser(
            currentUser._id,
            'auth.sendVerificationEmail',
            currentUser._id,
          );
        }

        await expect(expectedError()).to.be.rejectedWith('too-many-requests');
      });

      it('allows retry after 30 minutes when pattern showed automation', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 9 actions showing automation pattern, but 31 minutes ago
        for (let i = 0; i < 5; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(31, 'minutes')
              .subtract(i * 0.3, 'seconds')
              .toDate(),
          );
        }
        for (let i = 5; i < 10; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(31, 'minutes')
              .subtract(3 + (i - 5) * 0.3, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should succeed as it's been over 30 minutes
        const result = await callMethodWithUser(
          currentUser._id,
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);
      });

      it('locks account when 10 actions occur within 20 seconds', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 10 prior actions all within 19 seconds (action 0 is 0s ago, action 9 is 18s ago)
        for (let i = 0; i < 10; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(i * 1.8, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should lock the account
        async function expectedError() {
          await callMethodWithUser(
            currentUser._id,
            'auth.sendVerificationEmail',
            currentUser._id,
          );
        }

        await expect(expectedError()).to.be.rejectedWith('account-locked');

        // Verify the account is locked in the database
        const log = await ActionsLog.findOneAsync({ userId: currentUser._id });
        expect(log.locked).to.be.true;
      });

      it('throws error when account is already locked', async () => {
        const currentUser = await stubUser();

        // Create a locked account
        await ActionsLog.insertAsync({
          userId: currentUser._id,
          username: currentUser.username,
          verificationEmailSent: [],
          imageUploaded: [],
          locked: true,
        });

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        async function expectedError() {
          await callMethodWithUser(
            currentUser._id,
            'auth.sendVerificationEmail',
            currentUser._id,
          );
        }

        await expect(expectedError()).to.be.rejectedWith('account-locked');
      });

      it('allows action after break when previous burst was within 20 seconds but > 20 seconds ago', async () => {
        const currentUser = await stubUser();
        const now = moment();
        const timestamps = [];

        // Create 10 actions that were in a rapid burst (19s span), but the most recent is 25s old
        // This tests that timeSinceLastAction > 10000 prevents throttling from triggering
        for (let i = 0; i < 10; i += 1) {
          timestamps.push(
            now
              .clone()
              .subtract(25 + i * 1.8, 'seconds')
              .toDate(),
          );
        }

        await createActionsLogWithTimestamps(
          currentUser._id,
          currentUser.username,
          'verificationEmailSent',
          timestamps,
        );

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should succeed - the burst was quick but long enough ago
        const result = await callMethodWithUser(
          currentUser._id,
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);
      });
    });

    describe('timestamp arithmetic with Date objects', () => {
      it('correctly calculates time differences when SimpleSchema returns Date objects', async () => {
        const currentUser = await stubUser();

        // Create a log entry with one action, then trigger another
        await ActionsLog.insertAsync({
          userId: currentUser._id,
          username: currentUser.username,
          verificationEmailSent: [new Date()],
          imageUploaded: [],
          locked: false,
        });

        // Verify that timestamps are stored as Date objects by SimpleSchema
        const log = await ActionsLog.findOneAsync({ userId: currentUser._id });
        expect(log.verificationEmailSent[0]).to.be.a('date');

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        // Should succeed - the arithmetic correctly handles Date objects being converted by moment()
        const result = await callMethodWithUser(
          currentUser._id,
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);

        // Verify the action was logged with a Date object
        const updatedLog = await ActionsLog.findOneAsync({
          userId: currentUser._id,
        });
        expect(updatedLog.verificationEmailSent).to.have.lengthOf(2);
        expect(updatedLog.verificationEmailSent[0]).to.be.a('date');
      });
    });
  });
}
