import {apiSlice} from "../api/apiSlice";
import { setCredentials } from "../redux/slices/authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Giả sử API trả về: { data: { accessToken, user } }
          dispatch(setCredentials({
            accessToken: data.data.accessToken,
            user: data.data.user,
          }));
        } catch (error) {
          // Handle error nếu cần
          console.error('Login failed:', error);
        }
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Nếu register xong tự động login
          dispatch(setCredentials({
            accessToken: data.data.accessToken,
            user: data.data.user,
          }));
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Import logout action
          const { logout } = await import("../redux/slices/authSlice");
          dispatch(logout());
        } catch (error) {
          // Vẫn logout nếu API fail
          const { logout } = await import("../redux/slices/authSlice");
          dispatch(logout());
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;