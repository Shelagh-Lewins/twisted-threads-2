
import React from 'react';
import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from 'react-dropzone-uploader';

const callWithPromise = (method, myParameters) => {
	return new Promise((resolve, reject) => {
		Meteor.call(method, myParameters, (err, res) => {
			if (err) reject('Something went wrong');

			resolve(res);
		});
	});
};

const DropzoneUploader = ({ patternId }) => {
	const getUploadParams = async ({ meta }) => {
		const signedUrl = await callWithPromise('getUploadParams', { 'key': `test/${patternId}/${meta.name}` });
		console.log('signedUrl in client', signedUrl);
		return { 'url': signedUrl };
	};

	// called every time a file's `status` changes
	const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file); };

	// receives array of files that are done uploading when submit button is clicked
	const handleSubmit = (files, allFiles) => {
		console.log(files.map((f) => f.meta));
		allFiles.forEach((f) => f.remove());
	};

	return (
		<Dropzone
			getUploadParams={getUploadParams}
			onChangeStatus={handleChangeStatus}
			onSubmit={handleSubmit}
			accept="image/*"
		/>
	);
};

export default DropzoneUploader;
