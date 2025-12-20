    describe('register a new user', () => {
      // the tests that rely on Accounts.onCreateUser don't work because Accounts.onCreateUser doesn't run in testing.
      // There is a bug reported but closed:
      // https://github.com/meteor/meteor/issues/7395
      // I've tested this manually and it worked
      it('creates an account with the expected values', async () => {
        const userId = Accounts.createUser({
          email: 'me@there.com',
          username: 'NewUser',
          password: '12345678',
        });

        const { emails, username } = await Meteor.users.findOneAsync({
          _id: userId,
        });

        assert.equal(emails[0].address, 'me@there.com');
        assert.equal(username, 'NewUser');
      });
    });

    describe('get user count', () => {
      // counts all users with public patterns
      // plus the user themselves if logged in
      it('returns the number of users with public patterns if the user is not logged in', async () => {
        const { publicPatternUsernames } = createManyUsers();

        const result = await Meteor.callAsync('auth.getUserCount');

        assert.equal(result, publicPatternUsernames.length);
      });

      it('returns the number of users with public patterns plus one for the user if the user is logged in', async () => {
        const { privatePatternUserIds, publicPatternUsernames } =
          createManyUsers();

        const currentUser = await Meteor.users.findOneAsync({
          _id: privatePatternUserIds[0],
        });
        sinon.stub(Meteor, 'userAsync');
        Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

        sinon.stub(Meteor, 'userId');
        Meteor.userId.returns(currentUser._id);

        const result = await Meteor.callAsync('auth.getUserCount');

        assert.equal(result, publicPatternUsernames.length + 1);
        unwrapUser();
      });
    });
