// Partial store for PatternPreviews collection in database e.g. actions to call a method to save a pattern preview

import * as svg from 'save-svg-as-png';
import { logErrors, clearErrors } from './errors';

const Jimp = require('jimp');

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// used for create new and edit. Simply overwrite the data

export function savePatternPreview({ _id, elm }) { // eslint-disable-line import/prefer-default-export
	return () => {
		svg.svgAsPngUri(elm).then((uri) => {
			const base64Image = uri.split(';base64,').pop();

			Jimp.read(Buffer.from(base64Image, 'base64'), (err, image) => {
				if (err) throw err;
				image
					.rotate(90)
					.scaleToFit(496, 216) // resize to double the thumbnail size
					.getBase64(Jimp.AUTO, (err, res) => {
						// console.log('width', image.bitmap.width);
						Meteor.call('patternPreview.save', { _id, 'uri': res });
					});
			});
		});
	};
}
