import * as svg from 'save-svg-as-png';
import { PREVIEW_HEIGHT, PREVIEW_SCALE, PREVIEW_WIDTH } from '../imports/modules/parameters';

const Jimp = require('jimp');

const migrateAPreview = () => {
	const currentCount = global.previewCount;
	const _id = global.previewIds[currentCount];

	console.log('***');
	console.log('migrating pattern _id', _id);
	console.log('number', global.previewCount);

	Meteor.call('migrations.getPatternPreview', _id, (err, pattern) => {
		console.log('**** callback for ', _id);
		console.log('currentCount', currentCount);
		const myElm = document.createElement('div');
		myElm.innerHTML = pattern.auto_preview;
		const svgElm = myElm.getElementsByTagName('svg')[0];
		if (svgElm) {
			svg.svgAsPngUri(svgElm).then((uri) => {
				const base64Image = uri.split(';base64,').pop();

				Jimp.read(Buffer.from(base64Image, 'base64'), (err, image) => {
					if (err) throw err;
					image
						.scaleToFit(PREVIEW_HEIGHT * PREVIEW_SCALE, PREVIEW_WIDTH * PREVIEW_SCALE) // resize to double the thumbnail size
						.rotate(90)
						.getBase64(Jimp.AUTO, (err, res) => {
							Meteor.call('patternPreview.save', { _id, 'uri': res });
						});
				});
			});
		} else {
			console.log('svgElm not found for for', pattern._id);
		}
		Meteor.call('migrations.deleteAutoPreview', _id); // clear out the old entry from the pattern data in the Patterns collection
	});
	// without a delay, the method doesn't seem to get called
	// the timeout gives the server a chance to keep up
	if (global.previewCount + 1 < global.previewIds.length) {
		setTimeout(() => {
			global.previewCount += 1;
			migrateAPreview(global.previewIds[global.previewCount]);
		}, 200);
	} else {
		console.log('finished migrating pattern previews');
		console.log('count', global.previewCount);
	}
};

const migratePreviews = () => {
	console.log('starting to migrate pattern previews');
	Meteor.call('migrations.getPatternIds', (err, ids) => {
		console.log('number of patterns', ids.length);
		// let index = 0;

		// this will take maybe an hour and a half
		global.previewCount = 0;
		global.previewIds = ids;

		migrateAPreview();
	});
};

const runDataMigration = () => {
	console.log('*** runDataMigration');

	//migratePreviews();
};

export default runDataMigration;
