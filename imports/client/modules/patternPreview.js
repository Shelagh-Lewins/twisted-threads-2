// Partial store for PatternPreviews collection in database e.g. actions to call a method to save a pattern preview

import * as svg from 'save-svg-as-png';
import { logErrors, clearErrors } from './errors';

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// used for create new and edit. Simply overwrite the data

export function savePatternPreview({ _id, elm }) { // eslint-disable-line import/prefer-default-export
	return () => {
		svg.svgAsPngUri(elm).then((uri) => {
			Meteor.call('patternPreview.save', { _id, uri });
		});
	};
}

/* export const savePatternPreview = ({ _id, elm }) => (dispatch) => { // eslint-disable-line import/prefer-default-export
	console.log('about to call1');
	dispatch(clearErrors());

	return () => {
		console.log('about to call2');
		// convert the svg to a data uri
		svg.svgAsPngUri(elm).then((uri) => {
			console.log('uri', uri);
			Meteor.call('patternPreview.save', { _id, uri }, (error, result) => {
				if (error) {
					return dispatch(logErrors({ 'save-pattern-preview': error.reason }));
				}
			});
		});
	};
}; */
