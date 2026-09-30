import '../imports/server/modules/publications';
import '../imports/server/modules/searchPublications';
import { ROLES } from '../imports/modules/parameters';
import { buildServerLogText } from '../imports/server/modules/utils';
//import 'meteor/aldeed:collection2/static';
import 'meteor/aldeed:collection2/static';
import { Roles } from 'meteor/roles';

Meteor.startup(() => {
  (async () => {
    // log whether oplog is enabled
    console.log(
      'Oplog enabled in Meteor:',
      !!MongoInternals?.defaultRemoteCollectionDriver()?.mongo?._oplogHandle,
    );

    // ensure user roles exist (for loop enables await)
    for (const role of ROLES) {
      await Roles.createRoleAsync(role, { unlessExists: true });
    }

    Accounts.config({
      sendVerificationEmail: true,
    });

    Accounts.emailTemplates.siteName = 'Twisted Threads';
    Accounts.emailTemplates.from =
      'Twisted Threads <no-reply@twistedthreads.org>';
    // eslint-disable-next-line no-unused-vars
    Accounts.emailTemplates.verifyEmail.subject = (user) =>
      'Verify your email address';
    Accounts.emailTemplates.verifyEmail.text = (user, url) => {
      const urlWithoutHash = url.replace('#/', '');

      let text = `Hello ${user.username},\n\nThank you for registering with Twisted Threads, the online app for tablet weaving.`;

      text +=
        '\n\nIn order to activate your account, please verify your email address be clicking the link below:';

      text += `\n\n${urlWithoutHash}`;

      text +=
        '\n\nAlternatively, you can copy the verification code below and enter it on your Account page in Twisted Threads:';

      let code = urlWithoutHash.split('/');

      code = urlWithoutHash.split('/')[urlWithoutHash.split('/').length - 1];

      text += `\n\n${code}`;

      text += '\n\nBest wishes';

      text += '\n\nTwisted Threads';

      return text;
    };
    // eslint-disable-next-line no-unused-vars
    Accounts.emailTemplates.resetPassword.subject = (user) =>
      'Reset your password';
    Accounts.emailTemplates.resetPassword.text = (user, url) => {
      const urlWithoutHash = url.replace('#/', '');
      let text = `Hello ${user.username},\n\nTo reset your password on Twisted Threads, please click the link below.:\n\n ${urlWithoutHash}`;

      text += '\n\nBest wishes';

      text += '\n\nTwisted Threads';

      return text;
    };

    // make sure the current user has correct role based on whether their email address is verified
    Meteor.users.find().observeChanges({
      // eslint-disable-next-line object-shorthand
      changed: async function (_id) {
        const user = await Meteor.users.findOneAsync({ _id });
        if (!user) {
          return;
        }

        try {
          if (user.emails[0].verified) {
            await Roles.addUsersToRolesAsync(_id, ['verified']);
          } else {
            await Roles.removeUsersFromRolesAsync(_id, ['verified']);
          }
        } catch (err) {
          console.log(`error checking roles for user ${_id}`);
        }
      },
    });

    /* Configure rate limiter rules */
    // 1. Remove the weak default rule before we define custom rules
    Accounts.removeDefaultRateLimit();

    // 2. TIER 1: Strict Rule for High-Cost Email Actions (Max 3 per hour)
    const emailRule = {
      type: 'method',
      name(name) {
        return [
          'forgotPassword',
          'verifyEmail',
          'sendVerificationEmail',
        ].includes(name);
      },
      clientAddress() {
        return true;
      }, // Match by IP address
    };

    const emailRuleId = DDPRateLimiter.addRule(emailRule, 3, 3600000);

    // 3. Use that ID to attach your custom error message
    DDPRateLimiter.setErrorMessageOnRule(
      emailRuleId,
      'Too many email requests. Please try again later.',
    );

    // 3. TIER 2: Protected Rule for Authentication (Max 5 per 10 seconds)
    // This recreates the default protections for login/register, tracked securely by IP
    const authRule = {
      type: 'method',
      name(name) {
        return ['login', 'createUser', 'resetPassword'].includes(name);
      },
      clientAddress() {
        return true;
      }, // Match by IP address instead of just session ID
    };

    const authRuleId = DDPRateLimiter.addRule(authRule, 5, 10000);

    DDPRateLimiter.setErrorMessageOnRule(
      authRuleId,
      'Too many authentication requests. Please try again later.',
    );
  })();
});

Accounts.onCreateUser(async (options, user) => {
  const newUser = { ...user };
  // We still want the default hook's 'profile' behavior.
  newUser.profile = options.profile || {};
  newUser.nameSort = user.username.toLowerCase();
  newUser.publicPatternsCount = 0;
  newUser.publicColorBooksCount = 0;

  // assign the user the default role
  await Roles.addUsersToRolesAsync(newUser._id, 'registered');

  // log new user registrations so fail2ban can find them in the nginx logs
  const text = await buildServerLogText('[action]: Meteor create user');
  console.log(text);

  return newUser;
});

// log failed login attempts so fail2ban can find them in the Nginx logs
Accounts.onLoginFailure(async () => {
  const text = await buildServerLogText('[error]: Meteor login failure');
  console.log(text);
});
