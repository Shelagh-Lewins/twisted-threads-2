import React, { useMemo } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { uploadPatternImage } from '../modules/patternImages';
import { logErrors } from '../modules/errors';
import './ImageUploader.scss';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#7580ac',
  borderStyle: 'solid',
  backgroundColor: '#fafafa',
  color: '#999',
  outline: 'none',
  position: 'relative',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

function ImageUploader(props) {
  const {
    dispatch,
    imageUploadPreviewUrl,
    imageUploadProgress,
    onClose,
    patternId,
  } = props;

  const onFileAccept = (files) => {
    const file = files[0];

    // Defer dispatch to next tick to avoid React 18 render-phase update warnings
    setTimeout(() => {
      dispatch(uploadPatternImage({ dispatch, patternId, file }));
    }, 0);
  };

  const onFileReject = () =>
    dispatch(
      logErrors({
        'add-pattern-image':
          'File was not accepted. Check it is not larger than 2MB.',
      }),
    );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
    maxSize: 5000000,
    multiple: false,
    onDropAccepted: (acceptedFiles) => onFileAccept(acceptedFiles),
    onDropRejected: (acceptedFiles) => onFileReject(acceptedFiles),
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragAccept, isDragActive, isDragReject],
  );

  return (
    <div className='image-uploader dropzone'>
      <div className='uploader-container'>
        <div
          {
            ...getRootProps({
              style,
            }) /* eslint-disable-line react/jsx-props-no-spreading */
          }
        >
          <Button
            type='button'
            className='btn btn-close'
            aria-label='Close'
            onClick={onClose}
            title='Close'
          />
          <input
            {
              ...getInputProps() /* eslint-disable-line react/jsx-props-no-spreading */
            }
          />
          <p>Drag and drop a file here, or click to select a file</p>
          <p>Max file size 2MB</p>
          {imageUploadPreviewUrl && (
            <div
              className='upload-preview'
              style={{ backgroundImage: `url(${imageUploadPreviewUrl})` }}
            />
          )}
        </div>
        {imageUploadPreviewUrl && (
          <div className='upload-progress-bar'>
            <div
              className='slider'
              style={{ width: `${imageUploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

ImageUploader.propTypes = {
  dispatch: PropTypes.func.isRequired,
  imageUploadPreviewUrl: PropTypes.string,
  imageUploadProgress: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  patternId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    imageUploadPreviewUrl: state.patternImages.imageUploadPreviewUrl,
    imageUploadProgress: state.patternImages.imageUploadProgress,
  };
}

export default connect(mapStateToProps)(ImageUploader);
