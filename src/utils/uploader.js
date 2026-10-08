import imageCompression from 'browser-image-compression';
import api from './api';

export const uploadFile = async (file, type = 'image') => {
  let fileToUpload = file;

  if (type === 'image') {
    const options = {
      maxSizeMB: 1,           // Maksimal 1MB
      maxWidthOrHeight: 1920, // Dimensi maksimal 1920px (Full HD)
      useWebWorker: true
    };
    try {
      console.log('Original image size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      fileToUpload = await imageCompression(file, options);
      console.log('Compressed image size:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');
    } catch (error) {
      console.error('Error compressing image:', error);
      // Jika gagal kompresi, fallback ke file original
    }
  } else if (type === 'video') {
    // Note: Video compression di browser via FFmpeg WASM cukup berat dan rawan isu Cross-Origin Isolation.
    // Disarankan video dikompres di backend Go. Di sini kita hanya pass-through video aslinya.
    console.log('Video file detected, sending original file (compression should be handled by backend).');
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  // Backend returns { message: "...", data: { url: "https://..." } }
  return response.data.data.url;
};
