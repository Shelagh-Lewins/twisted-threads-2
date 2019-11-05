import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '../../imports/modules/store';
import App from '../../imports/containers/App';

function AppRoot() {
	return (
		<div className="app-container">
			<Provider store={store}>
				<App />
			</Provider>
		</div>
	);
}

Meteor.startup(() => {
	ReactDOM.render(
		<AppRoot />,
		document.getElementById('root'),
	);
});
