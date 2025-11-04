import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /User/me - Get current user profile
    getMyProfile: builder.query({
      query: () => ({
        url: '/User/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    // PUT /User/me - Update profile
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/User/me',
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // PUT /User/change-password - Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/User/me/password',
        method: 'PUT',
        data: passwordData,
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi;