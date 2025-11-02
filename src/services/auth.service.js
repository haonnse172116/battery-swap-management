import { apiSlice } from "../api/apiSlice";
import { setCredentials, logout, setTempToken } from "../redux/slices/authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: '/Auth/register',
        method: 'POST',
        data: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          dispatch(setTempToken({
            token: data.content.token,
            email: arg.email,
            userId: data.content.userId,
          }));
        } catch (error) {
          console.error('Register failed:', error);
          throw error;
        }
      },
    }),
    
    verifyOtp: builder.mutation({
      query: ({ otp, token }) => ({
        url: `/Auth/activate-account/${otp}`,
        method: 'POST',
        data: { otp },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          dispatch(setCredentials({
            accessToken: data.content.token,
            user: {
              userId: data.content.userId,
              fullName: data.content.fullName,
              email: data.content.email,
              role: data.content.role,
              status: data.content.status,
            },
          }));
        } catch (error) {
          console.error('OTP verification failed:', error);
          throw error;
        }
      },
    }),
    
    // ========== RESEND OTP ==========
    resendOtp: builder.mutation({
      query: (token) => ({
        url: '/Auth/resend-register-otp',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    
    // ========== LOGIN ==========
    login: builder.mutation({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // ✅ Check status
          if (data.content.status === 'Inactive') {
            dispatch(setTempToken({
              token: data.content.token,
              email: data.content.email,
              userId: data.content.userId,
              needsActivation: true,
            }));
            return;
          }
          
          // ✅ Active user
          dispatch(setCredentials({
            accessToken: data.content.token,
            user: {
              userId: data.content.userId,
              fullName: data.content.fullName,
              email: data.content.email,
              role: data.content.role,
              status: data.content.status,
            },
          }));
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
    }),
    
    // ========== LOGOUT ==========
    logout: builder.mutation({
      query: () => ({
        url: '/Auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          dispatch(logout());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLogoutMutation,
} = authApi;