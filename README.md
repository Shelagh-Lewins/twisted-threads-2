# meteor-react-redux-auth
A demo app using Meteor 1.8.1 with React and Redux.

This is intended as a bare-bones but complete app that demonstrates how to use Meteor/React/Redux together.

# Quick start
```
git clone https://github.com/Shelagh-Lewins/meteor-react-redux-auth.git
cd meteor-react-redux-auth
npm install
meteor
```

# Run with environment variables
To send emails, you'll need to provide a valid MAIL_URL.

1. Copy and rename the file ```.env.template``` to ```.env```
2. Enter your mail credentials in ```.env```. NEVER commit ```.env``` to GitHub.
3. Start the app by executing the script ```
run_meteor.js
```

The script will first load the environment variables from .env and then run Meteor. This avoids using settings.json and better simulates a production environment.

# Features
* Routing with react-router
* User authentication including account creation, login, logout, email validation, forgot password and reset password. Meteor Accounts and Email packages drive the back end. The UI is written in React and Redux.
* Formik forms with client-side validation
* Styling with SCSS and Bootstrap
* Server-side pagination using react-paginate.
* updeep to update deeply nested objects/arrays in the reducer
* Linting with eslint and sass-lint, based on the AirBnB configuration with react-app and meteor, plus a .eslintrc.json file for custom configuration
