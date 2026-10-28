import api from '../api/api';

// Base URL for S3 images
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'https://triaxxss.s3.ap-south-1.amazonaws.com/';

class FileUploadService {
  // Upload file (supports /fileupload/upload, /fileupload, /fileupload/fileupload)
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = { 'Content-Type': 'multipart/form-data' };

    try {
      const response = await api.post('/fileupload/upload', formData, { headers });
      return response.data;
    } catch (err1) {
      try {
        const response = await api.post('/fileupload', formData, { headers });
        return response.data;
      } catch (err2) {
        try {
          const response = await api.post('/fileupload/fileupload', formData, { headers });
          return response.data;
        } catch (err3) {
          throw this.handleError(err1 || err2 || err3);
        }
      }
    }
  }

  // Get full image URL from tail, object metadata, or data URI
  getFullImageUrl(image) {
    if (!image) return '';

    // Handle serialized media metadata object (Point 5 & Point 7 of audit)
    if (typeof image === 'object') {
      if (image.image_url) return image.image_url;
      if (image.image) return this.getFullImageUrl(image.image);
      if (image.image_source) return image.image_source;
      if (image.url) return image.url;
      return '';
    }

    if (typeof image !== 'string') return '';

    // Handle full URL, blob URL, or embedded SVG data URI
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('blob:')) {
      return image;
    }

    // Relative S3 image key
    return `${IMAGE_BASE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
}

export default new FileUploadService();
