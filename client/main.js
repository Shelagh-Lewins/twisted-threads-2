import React from 'react';
import ReactDOM from 'react-dom';
import App from '../imports/client/containers/App';
import 'bootstrap/dist/css/bootstrap.css';
import '../imports/modules/collection';
import runDataMigration from './runDataMigration';

Meteor.startup(() => {
	Meteor.call('migrations.runMigrations', ((err, res) => {
		console.log('*** runMigrations', res);
		if (res) {
			runDataMigration();
		}
	}));

	ReactDOM.render(
		<App />,
		document.getElementById('root'),
	);
});
