// slingshot image uploader
// puts files in an AWS (Amazon Web Services) bucket

const moment = require('moment');

// if (Meteor.isClient) {
	/* uploader = new ReactiveVar();

	var currentUserId = Meteor.userId();
	Session.set('upload_status', 'not started');

	Template.image_uploader.events({'change .uploadFile': function(event, template){
			event.preventDefault();
			var pattern_id = Router.current().params._id;
			var file = document.getElementById('uploadFile').files[0];
			
			Meteor.my_functions.upload_pattern_image(file, pattern_id);
		}
	});

	Meteor.subscribe('images'); */
// }

if (Meteor.isServer) {
	Slingshot.fileRestrictions("myImageUploads", {
		'allowedFileTypes': ["image/png", "image/jpeg", "image/gif"],
		'maxSize': 2 * 1024 * 1024,
	});

	Slingshot.createDirective('myImageUploads', Slingshot.S3Storage, {
		'AWSAccessKeyId': process.env.AWS_ACCESS_KEY_ID,
		'AWSSecretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
		'bucket': process.env.AWS_BUCKET,
		'acl': 'public-read',
		'region': process.env.AWSRegion,

		'authorize': function (file, context) {
			// User must be logged in
			if (!this.userId) {
				const message = 'You are not logged in.';
				throw new Meteor.Error("not-authorized", message);
			}

			// User must have verified their email address
			const user = Meteor.users.findOne({ '_id': this.userId }, { 'fields': {emails: 1}});
			if (!user.emails[0].verified) {
				const message = 'Your email address is not verified.';
				throw new Meteor.Error("not-authorized", message);
			}
return true;
			// User must own the pattern
			const pattern = Patterns.findOne({ _id: context.patternId }, { fields: {createdBy: 1}});
			if (pattern.created_by !== this.userId)
			{
				const message = "You did not create this pattern.";
				throw new Meteor.Error("not-authorized", message);
			}
/*
			// check for too many image uploads too fast
			const document_id = Meteor.call('get_actions_log');

			const db_document = ActionsLog.findOne({_id: document_id}, {fields: { image_uploaded: 1, locked: 1 }} );

			const event_log = db_document.image_uploaded;

			if (db_document.locked)
			throw new Meteor.Error("account-locked", "Your account has been locked, please contact an administrator");
		
			const number_of_entries = event_log.length;
			const time_since_last_action = moment().valueOf() - event_log[0];

			// try to detect automated image uploads
			// A human shouldn't be able to upload 10 images in 2 seconds
			const last_10_actions_in = event_log[0] - event_log[9];
			if (last_10_actions_in < 2000)
			{
				ActionsLog.update( {_id: document_id}, { locked: true } );
				throw new Meteor.Error("account-locked", "Your account has been locked, please contact an administrator");
			}

			const last_5_actions_in = event_log[0] - event_log[4];
			if (last_5_actions_in < 2000)
			{
				// Don't allow another attempt for 5 minutes
				if (time_since_last_action < (60 * 1000 * 5))
					throw new Meteor.Error("too-many-requests", "Please wait 5 mins before retrying");

				// it's been at least 5 mins so consider allowing another image upload
				else
				{
					const previous_5_actions_in = event_log[4] - event_log[9];
					if (previous_5_actions_in < 2000)
					{
						// if the 5 previous actions were in 2 seconds, wait 30 minutes
						// this looks like an automatic process that has tried continually
						if (time_since_last_action < (60 * 1000 * 30 + 4000))
							throw new Meteor.Error("too-many-requests", "Please wait 30 mins before retrying");
					}
				}
			}

			// record the action in the log
			ActionsLog.update( {_id: document_id}, { $push: { image_uploaded: {
				$each: [moment().valueOf()],
				$position: 0 
			}}} );
	;
			// remove the oldest log entry if too many stored
			if (number_of_entries > Meteor.settings.private.image_uploads_num_to_log)
			{
				ActionsLog.update( {_id: document_id}, { $pop: { image_uploaded: 1 }} );
			} */

			return true;
		},

		'key': function (file) {
			const parts = file.name.split("."); // find the file extension
			const extension = parts.pop();
			let name = parts.join(""); // find the name
			name = name.slice(0,30) + "-" + moment().valueOf().toString() + "." + extension; // use the first 30 chars of the name, plus timestamp, plus file extension, to make a meaningful name that is unique to this user
			return Meteor.userId() + "/" + name;
		},
	});
}
