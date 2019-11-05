import React from 'react';
// import AddPattern from '../../../imports/client/components/AddPattern';
// import PatternList from '../../../imports/client/components/PatternList';
import Footer from '../components/Footer';
import DevTools from '../components/DevTools';

export default function App() {
	return (
		<div className="app-container">
			<DevTools />
			{/* <AddPattern />
			<PatternList /> */}
			<Footer />
		</div>
	);
}
