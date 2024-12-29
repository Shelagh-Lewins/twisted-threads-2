// methods to support migrations running on the client
import { Patterns } from '../../imports/modules/collection';

Meteor.methods({
  'migrations.runMigrations': async function () {
    // tell the client whether to run migrations
    return process.env.MIGRATIONS === 'migrations';
  },
  // don't use publish, because it would interfere with the app's normal running by putting extra docs in minimongo
  'migrations.getPatternIds': async function () {
    // tell the client whether to run migrations
    return Patterns.find({}, { fields: { _id: 1 } })
      .fetchAsync()
      .map((pattern) => pattern._id);
  },
  'migrations.getPatternPreview': async function (_id) {
    // tell the client whether to run migrations
    return Patterns.findOneAsync({ _id }, { fields: { auto_preview: 1 } });
  },
  'migrations.deleteAutoPreview': async function (_id) {
    // tell the client whether to run migrations
    Patterns.updateAsync({ _id }, { $unset: { auto_preview: 1 } });
  },
});
