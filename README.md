# Twisted Threads 2

An app for tablet weaving built using Meteor 2.9 with React and Redux. It is the replacement for Twisted Threads.

This is built on top of the
[Meteor/React/Redux/Auth demo app](https://github.com/Shelagh-Lewins/meteor-react-redux-auth).

# Quick start

Install Meteor 2.9.

In a terminal window, cd into your Meteor directory. Then run the following:

```
git clone https://github.com/Shelagh-Lewins/twisted-threads-2.git
cd twisted-threads-2
npm install
meteor
```

# Run with environment variables

To send emails, you'll need to provide a valid MAIL_URL.

To save pattern images and preview thumbnails, you'll need to provide AWS credentials.

Required environment variables for S3 uploads (using AWS SDK):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BUCKET`
- (optional) `AWSRegion`

1. Copy and rename the file `.env.template` to `.env`
2. Enter your mail and any other credentials in `.env`. NEVER commit `.env` to GitHub.
3. Start the app by executing the script `run_meteor.js`

Note: The application creates search-related MongoDB indexes automatically at server startup. If the database user does not have privileges to create indexes, the index creation will fail and an error will be logged on startup; ensure the DB user has index creation privileges in environments where automatic creation is desired.

The script will first load the environment variables from .env and then run Meteor. This avoids using settings.json and better simulates a production environment.

# Tests

Run server-side tests by executing the script `test_meteor.sh`

# Release notes

## Release 2.2.0

2 January 2023

- Meteor upgraded to v2.9, and other upgrades
- Minor tweaks
- Pattern previews are now stored in AWS, not the database

## Release 2.0

March - April 2020
This is the initial release of Twisted Threads 2 and includes:

- Data migration from the existing Twisted Threads database
- Colour Books (major new feature)
- Improved user interface for designing patterns
