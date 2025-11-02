import { apiSlice } from '../api/apiSlice';

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCloudinarySignature: builder.query({
      query: ({ fileName = 'batteries' } = {}) => ({
        url: '/File/upload/avatar',
        method: 'POST',
        params: { fileName },
      }),
    }),
  }),
});

export const {
  useGetCloudinarySignatureQuery,
  useLazyGetCloudinarySignatureQuery,
} = uploadApi;

export const uploadToCloudinary = async (file, signatureData) => {
  const formData = new FormData();

  formData.append('file', file);
  
  formData.append('timestamp', signatureData.timestamp);
  formData.append('signature', signatureData.signature);
  formData.append('api_key', signatureData.key || '');
  formData.append('folder', signatureData.folder);
  formData.append('tags', 'avatar,profile');
  
  try {
    const response = await fetch(signatureData.url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};