import React from 'react';
import { Provider } from 'react-redux';
import store from '../modules/store';

import Footer from '../components/Footer';
import DevTools from '../components/DevTools';

function App() {
	return (
		<div className="app-container">
			<Provider store={store}>
				<DevTools />
				<Footer />
			</Provider>
		</div>
	);
}

export default App;
