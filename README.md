# Twisted Threads 2
An app for tablet weaving built using Meteor 1.8.1 with React and Redux. It will be the replacement for Twisted Threads.

This is built on top of the 
[Meteor/React/Redux/Auth demo app](https://github.com/Shelagh-Lewins/meteor-react-redux-auth).


# Quick start
Install Meteor 1.8.1.

In a terminal window, cd into your Meteor directory. Then run the following:

```
git clone https://github.com/Shelagh-Lewins/twisted-threads-2.git
cd twisted-threads-2
npm install
meteor
```

# Run with environment variables
To send emails, you'll need to provide a valid MAIL_URL.

1. Copy and rename the file ```.env.template``` to ```.env```
2. Enter your mail credentials in ```.env```. NEVER commit ```.env``` to GitHub.
3. Start the app by executing the script ```
run_meteor.js```

The script will first load the environment variables from .env and then run Meteor. This avoids using settings.json and better simulates a production environment.
