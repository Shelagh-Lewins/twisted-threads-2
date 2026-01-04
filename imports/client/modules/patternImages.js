// Partial store for PatternImages collection in database, which logs urls of images that have been uploaded by users to their patterns
import { clearErrors, logErrors } from './errors';
import * as updeepModule from 'updeep';
const updeep = updeepModule.default || updeepModule;

// ////////////////////////////////
// Action creators

export const UPDATE_IMAGE_UPLOAD_PROGRESS = 'UPDATE_IMAGE_UPLOAD_PROGRESS';
export const UPDATE_IMAGE_UPLOAD_PREVIEW = 'UPDATE_IMAGE_UPLOAD_PREVIEW';

// define action types so they are visible
// and export them so other reducers can use them

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

export function updateImageUploadPreview(url) {
  return {
    type: UPDATE_IMAGE_UPLOAD_PREVIEW,
    payload: url,
  };
}

export function updateImageUploadProgress(imageUploadProgress) {
  return {
    type: UPDATE_IMAGE_UPLOAD_PROGRESS,
    payload: imageUploadProgress,
  };
}

// used for create new and edit. Simply overwrite the data
export function uploadPatternImage({ dispatch, patternId, file }) {
  // eslint-disable-line import/prefer-default-export
  return async () => {
    dispatch(clearErrors());
    dispatch(updateImageUploadProgress(0));

    try {
      // Get presigned POST data from server
      const presignedData = await Meteor.callAsync(
        'patternImages.getPresignedPost',
        {
          patternId,
          fileName: file.name,
          fileType: file.type,
        },
      );

      const { url, fields, key, downloadUrl } = presignedData;

      // Show preview URL immediately
      dispatch(updateImageUploadPreview(downloadUrl));

      // Build FormData for S3 upload
      const formData = new FormData();

      // Add all fields from presigned POST (must come before file)
      Object.keys(fields).forEach((fieldKey) => {
        formData.append(fieldKey, fields[fieldKey]);
      });

      // Add the file last
      formData.append('file', file);

      // Upload to S3 using XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          dispatch(updateImageUploadProgress(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 204 || xhr.status === 200) {
          // S3 upload successful, now log to database
          dispatch(updateImageUploadPreview(null));
          dispatch(updateImageUploadProgress(0));

          Meteor.call(
            'patternImages.add',
            { _id: patternId, downloadUrl },
            (error, result) => {
              if (error) {
                return dispatch(
                  logErrors({ 'add-pattern-image': error.reason }),
                );
              }
            },
          );
        } else {
          // S3 upload failed
          dispatch(
            logErrors({
              'image-upload': `Image upload failed with status ${xhr.status}`,
            }),
          );
        }
      });

      xhr.addEventListener('error', () => {
        dispatch(updateImageUploadPreview(null));
        dispatch(updateImageUploadProgress(0));
        dispatch(logErrors({ 'image-upload': 'Network error during upload' }));
      });

      xhr.addEventListener('abort', () => {
        dispatch(updateImageUploadPreview(null));
        dispatch(updateImageUploadProgress(0));
        dispatch(logErrors({ 'image-upload': 'Upload was cancelled' }));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    } catch (error) {
      dispatch(
        logErrors({
          'image-upload':
            error.reason || error.message || 'Error uploading image',
        }),
      );
    }
  };
}

export function removePatternImage(_id) {
  // eslint-disable-line import/prefer-default-export
  return () => {
    Meteor.call('patternImages.remove', { _id });
  };
}

export function editPatternImageCaption({ _id, fieldValue }) {
  // eslint-disable-line import/prefer-default-export
  return () => {
    Meteor.call('patternImages.editCaption', { _id, fieldValue });
  };
}

// ///////////////////////////
// State

// default state
const initialAuthState = {
  imageUploadProgress: 0,
  imageUploadPreviewUrl: null,
};

// state updates
export default function auth(state = initialAuthState, action) {
  switch (action.type) {
    case UPDATE_IMAGE_UPLOAD_PROGRESS: {
      return updeep({ imageUploadProgress: action.payload }, state);
    }

    case UPDATE_IMAGE_UPLOAD_PREVIEW: {
      return updeep({ imageUploadPreviewUrl: action.payload }, state);
    }

    default:
      return state;
  }
}
