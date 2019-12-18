import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// import { clearErrors } from '../modules/errors';
import { uploadPatternImage } from '../modules/patternImages';

const baseStyle = {
	'flex': 1,
	'display': 'flex',
	'flexDirection': 'column',
	'alignItems': 'center',
	'padding': '20px',
	'borderWidth': 2,
	'borderRadius': 2,
	'borderColor': '#7580ac',
	'borderStyle': 'solid',
	'backgroundColor': '#fafafa',
	'color': '#999',
	'outline': 'none',
	'transition': 'border .24s ease-in-out',
};

const activeStyle = {
	'borderColor': '#2196f3',
};

const acceptStyle = {
	'borderColor': '#00e676',
};

const rejectStyle = {
	'borderColor': '#ff1744',
};

function ImageUploader(props) {
	const { patternId, dispatch } = props;

	const onFileChange = (files) => {
		const file = files[0];

		// dispatch(clearErrors());
		dispatch(uploadPatternImage({ dispatch, patternId, file }));

		return;
		const uploader = new Slingshot.Upload('myImageUploads', patternId);

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
	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		'accept': 'image/*',
		'maxSize': 5000000,
		'multiple': false,
		'onDrop': (acceptedFiles) => onFileChange(acceptedFiles),
	});

	const style = useMemo(() => ({
		...baseStyle,
		...(isDragActive ? activeStyle : {}),
		...(isDragAccept ? acceptStyle : {}),
		...(isDragReject ? rejectStyle : {}),
	}), [
		isDragAccept,
		isDragActive,
		isDragReject,
	]);

	return (
		<div className="image-uploader dropzone">
			<div className="container">
				<div {...getRootProps({ style }) /* eslint-disable-line react/jsx-props-no-spreading */}>
					<input {...getInputProps() /* eslint-disable-line react/jsx-props-no-spreading */} />
					<p>Drag and drop a file here, or click to select a file</p>
				</div>
			</div>
		</div>
	);
}

ImageUploader.propTypes = {
	'patternId': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
};

export default ImageUploader;
