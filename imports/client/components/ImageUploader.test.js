import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ImageUploader from './ImageUploader';

const mockStore = configureStore([]);

describe('ImageUploader preview-before-upload', () => {
  let store;
  let onClose;

  beforeEach(() => {
    store = mockStore({
      patternImages: {
        imageUploadPreviewUrl: null,
        imageUploadProgress: 0,
      },
    });
    store.dispatch = jest.fn();
    onClose = jest.fn();
  });

  function setup() {
    return render(
      <Provider store={store}>
        <ImageUploader patternId='test-pattern' onClose={onClose} />
      </Provider>,
    );
  }

  it('shows preview and confirm/cancel after image selection', async () => {
    setup();
    const file = new File([new ArrayBuffer(10)], 'test.png', {
      type: 'image/png',
    });
    const input = screen
      .getByLabelText('Close')
      .parentElement.querySelector('input[type="file"]');
    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });
    // Wait for preview and confirm/cancel buttons
    await waitFor(() => {
      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('shows error for non-image file', async () => {
    setup();
    const file = new File([new ArrayBuffer(10)], 'test.txt', {
      type: 'text/plain',
    });
    const input = screen
      .getByLabelText('Close')
      .parentElement.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/File must be an image/)).toBeInTheDocument();
    });
  });

  it('shows error for file >2MB', async () => {
    setup();
    const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.png', {
      type: 'image/png',
    });
    const input = screen
      .getByLabelText('Close')
      .parentElement.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/File is too large/)).toBeInTheDocument();
    });
  });

  it('cancels preview and resets state', async () => {
    setup();
    const file = new File([new ArrayBuffer(10)], 'test.png', {
      type: 'image/png',
    });
    const input = screen
      .getByLabelText('Close')
      .parentElement.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
