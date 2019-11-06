import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../modules/store';

import Navbar from '../components/Navbar';
import Home from './Home';
import Pattern from './Pattern';
import DevTools from '../components/DevTools';

function App() {
	return (
		<Provider store={store}>
			<Router>
				<div className="app-container">
					<Navbar />
					<div className="main-container">
						<DevTools />
						<Route exact path="/" component={Home} />
						<Route exact path="/pattern/:id" component={Pattern} />
					</div>
				</div>
			</Router>
		</Provider>
	);
}

export default App;
