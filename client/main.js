import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../imports/client/containers/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../imports/modules/collection';
//simport 'meteor/aldeed:collection2/static';
import 'meteor/aldeed:collection2/static';
//
Meteor.startup(() => {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = createRoot(rootEl);
    root.render(<App />);
  }
});
