// Partial store for PatternPreviews collection in database e.g. actions to call a method to save a pattern preview

import * as svg from 'save-svg-as-png';
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from '../../modules/parameters';

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
					.scaleToFit(PREVIEW_HEIGHT, PREVIEW_WIDTH) // resize to double the thumbnail size
					.rotate(90)
					.getBase64(Jimp.AUTO, (err, res) => {
						Meteor.call('patternPreview.save', { _id, 'uri': res });
					});
			});
		});
	};
}
