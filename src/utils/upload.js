import api from './api';
import imageCompression from 'browser-image-compression';

export const uploadFile = async (file, onProgress = null) => {
  if (!file) return null;

  let fileToUpload = file;

  // Check if it is an image (excluding gifs since compression breaks them usually, or SVGs)
  if (file.type.startsWith('image/') && !file.type.includes('svg') && !file.type.includes('gif')) {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      // Fallback to original if compressed is somehow larger
      if (compressedFile.size < file.size) {
        fileToUpload = compressedFile;
      }
    } catch (error) {
      console.error('Image compression failed:', error);
    }
  }

  // Videos and other files pass through without compression (handled by backend)

  const uploadForm = new FormData();
  uploadForm.append('file', fileToUpload);

  const uploadRes = await api.post('/upload', uploadForm, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 menit agar tidak timeout pada file besar
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  });

  return uploadRes.data.url || uploadRes.data?.data?.url;
};
