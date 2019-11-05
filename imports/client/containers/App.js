import React from 'react';
import { Provider } from 'react-redux';
import store from '../modules/store';

import Home from './Home';

import Footer from '../components/Footer';
import DevTools from '../components/DevTools';

function App() {
	return (
		<div className="app-container">
			<Provider store={store}>
				<DevTools />
				<Home />
				<Footer />
			</Provider>
		</div>
	);
}

export default App;
