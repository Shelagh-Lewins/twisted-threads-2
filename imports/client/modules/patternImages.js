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
  return () => {
    dispatch(clearErrors());
    dispatch(updateImageUploadProgress(0));

    const uploader = new Slingshot.Upload('myImageUploads', { patternId });
    let computation = null;

    try {
      uploader.send(file, (error, downloadUrl) => {
        computation.stop(); // Stop progress tracking on upload finish

        if (error) {
          if (uploader.xhr) {
            dispatch(logErrors({ 'image-upload': uploader.xhr.response }));
          }
          dispatch(logErrors({ 'image-upload': error.reason }));
        } else {
          dispatch(updateImageUploadPreview(null));

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
        }
      });
    } catch (error) {
      dispatch(
        logErrors({
          'image-upload': `error uploading image: ${error.message}`,
        }),
      );
    }

    dispatch(updateImageUploadPreview(uploader.url));

    // Track Progress
    computation = Tracker.autorun(() => {
      if (!isNaN(uploader.progress())) {
        dispatch(updateImageUploadProgress(uploader.progress() * 100));
      }
    });
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
