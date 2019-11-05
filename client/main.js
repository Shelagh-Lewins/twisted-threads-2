import React from 'react';
import ReactDOM from 'react-dom';
import App from '../imports/client/containers/App';

Meteor.startup(() => {
	ReactDOM.render(
		<App />,
		document.getElementById('root'),
	);
});
