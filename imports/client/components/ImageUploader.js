import React, { useMemo, useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { uploadPatternImage, updateImageUploadPreview } from '../modules/patternImages';
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
  // Cleanup preview URL on unmount
  // Local state for preview and file
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null); // { name, size, width, height }
  const [validationError, setValidationError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  React.useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const {
    dispatch,
    imageUploadPreviewUrl,
    imageUploadProgress,
    onClose,
    patternId,
  } = props;
  // Helper to validate file and generate preview
  const validateAndPreviewFile = useCallback((file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve({ isValid: false, error: 'File must be an image.' });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        resolve({ isValid: false, error: 'File is too large (max 2MB).' });
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        // Optionally, add dimension checks here
        resolve({
          isValid: true,
          error: null,
          previewUrl: url,
          info: {
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
          },
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ isValid: false, error: 'Could not read image.' });
      };
      img.src = url;
    });
  }, []);


  // Validate image type, size, and dimensions
  const validateImage = useCallback((file) => {
    // Type check
    if (!file.type.startsWith('image/')) {
      return 'File must be an image.';
    }
    // Size check (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return 'File is too large (max 2MB).';
    }
    return null;
  }, []);

  // Handle file selection
  const onFileAccept = useCallback((files) => {
    const file = files[0];
    validateAndPreviewFile(file).then((result) => {
      if (!result.isValid) {
        setValidationError(result.error);
        setLocalPreviewUrl(null);
        setSelectedFile(null);
        setFileInfo(null);
        setIsConfirming(false);
        return;
      }
      setLocalPreviewUrl(result.previewUrl);
      setSelectedFile(file);
      setFileInfo(result.info);
      setValidationError(null);
      setIsConfirming(true);
    });
  }, [validateAndPreviewFile]);

  const onFileReject = () => {
    setValidationError('File was not accepted. Check it is not larger than 2MB.');
    setLocalPreviewUrl(null);
    setSelectedFile(null);
    setIsConfirming(false);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
    maxSize: 2097152, // 2MB
    multiple: false,
    onDropAccepted: onFileAccept,
    onDropRejected: onFileReject,
    disabled: isConfirming || !!imageUploadProgress,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
      ...(isConfirming ? { opacity: 0.5, pointerEvents: 'none' } : {}),
    }),
    [isDragAccept, isDragActive, isDragReject, isConfirming],
  );

  // Confirm upload handler
  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    dispatch(uploadPatternImage({ dispatch, patternId, file: selectedFile }));
    setIsConfirming(false);
    setLocalPreviewUrl(null);
    setSelectedFile(null);
    setValidationError(null);
  };

  // Cancel/clear selection handler
  const handleCancel = () => {
    setIsConfirming(false);
    setLocalPreviewUrl(null);
    setSelectedFile(null);
    setFileInfo(null);
    setValidationError(null);
    // Also clear preview in redux if present
    dispatch(updateImageUploadPreview(null));
    // Cleanup preview URL
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
  };

  return (
    <div className='image-uploader dropzone'>
      <div className='uploader-container'>
        {/* Dropzone area, disabled during confirmation or upload */}
        <div
          {...getRootProps({ style })}
        >
          <Button
            type='button'
            className='btn btn-close'
            aria-label='Close'
            onClick={onClose}
            title='Close'
          />
          <input {...getInputProps()} />
          <p>Drag and drop a file here, or click to select a file</p>
          <p>Max file size 2MB</p>
        </div>

        {/* Show local preview and confirm/cancel if a file is selected */}
        {localPreviewUrl && isConfirming && fileInfo && (
          <div className='pre-upload-preview'>
            <div className='preview-image'>
              <img src={localPreviewUrl} alt='Preview' style={{ maxWidth: '100%', maxHeight: 200 }} />
            </div>
            <div className='file-info'>
              <div><strong>Filename:</strong> {fileInfo.name}</div>
              <div><strong>Size:</strong> {(fileInfo.size / 1024).toFixed(1)} KB</div>
              <div><strong>Dimensions:</strong> {fileInfo.width} × {fileInfo.height} px</div>
            </div>
            <div className='preview-actions'>
              <Button color='primary' onClick={handleConfirmUpload} disabled={!selectedFile}>
                Upload Image
              </Button>
              <Button color='secondary' onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Show upload progress if uploading and not in preview confirmation */}
        {imageUploadProgress > 0 && !isConfirming && (
          <div className='upload-progress-bar'>
            <div
              className='slider'
              style={{ width: `${imageUploadProgress}%` }}
            />
          </div>
        )}

        {/* Show error if present */}
        {validationError && (
          <div className='upload-error'>
            {validationError}
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
