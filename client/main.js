import React from 'react';
import ReactDOM from 'react-dom';
import App from '../imports/client/containers/App';
import 'bootstrap/dist/css/bootstrap.css';
import '../imports/modules/collection';
//
Meteor.startup(() => {
	ReactDOM.render(
		<App />,
		document.getElementById('root'),
	);
});
