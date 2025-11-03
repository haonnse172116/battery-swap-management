import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => ({
        url: '/User/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/User/me',
        method: 'PUT',
        data: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/User/change-password',
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