import React from 'react';

function ImageUploader() {
	const onUploadFileChange = (event) => {
		const file = event.target.files[0];
		console.log('selected file', file);

		const uploader = new Slingshot.Upload('myImageUploads');

		uploader.send(file, (error, downloadUrl) => {
			if (error) {
				// Log service detailed response.
				console.log('error', error);
				if (uploader.xhr) {
					console.error('Error uploading', uploader.xhr.response);
				}
				alert (error);
			} else {
				console.log('uploaded', downloadUrl);
				// Meteor.users.update(Meteor.userId(), {$push: {"profile.files": downloadUrl}});
			}
		});
	};

	return (
		<div className="image-uploader">
			<input
				type="file"
				className="uploadFile"
				id="uploadFile"
				onChange={onUploadFileChange}
			/>
		</div>
	);
}

export default ImageUploader;
