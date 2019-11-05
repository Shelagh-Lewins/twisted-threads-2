import React from 'react';
import ReactDOM from 'react-dom';
import App from '../imports/client/containers/App.jsx';

Meteor.startup(() => {
	ReactDOM.render(
		<App />,
		document.getElementById('root'),
	);
});
