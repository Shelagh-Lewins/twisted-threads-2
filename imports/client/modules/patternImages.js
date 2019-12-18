// Partial store for PatternImages collection in database, which logs urls of images that have been uploaded by users to their patterns


// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// used for create new and edit. Simply overwrite the data
import { clearErrors, logErrors } from './errors';

export function uploadPatternImage({ dispatch, patternId, file }) { // eslint-disable-line import/prefer-default-export
	return () => {
		dispatch(clearErrors());

		const uploader = new Slingshot.Upload('myImageUploads', { patternId });

		uploader.send(file, (error, downloadUrl) => {
			if (error) {
				if (uploader.xhr) {
					dispatch(logErrors({ 'image-upload': uploader.xhr.response }));
				}
				dispatch(logErrors({ 'image-upload': error.reason }));
			} else {
				console.log('uploaded to:', downloadUrl);
				// To DO add the image url to the collection so it can be displayed and updated
			}
		});
	};
}
