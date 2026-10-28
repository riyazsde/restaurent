import api from './api';

export const fileUploadApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/fileupload', formData);
  }
};
