import { apiSlice } from "../api/apiSlice";
import { setCredentials, setTempToken, logout } from "../redux/slices/authSlice";

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
          sessionStorage.setItem('tempPassword', arg.password);
          
          dispatch(setTempToken({
            token: data.content.token,
            email: arg.email,
            userId: data.content.userId,
            needsActivation: true,
          }));
        } catch (error) {
          sessionStorage.removeItem('tempPassword');
          throw error;
        }
      },
    }),
    
    verifyOtp: builder.mutation({
      query: ({ otp }) => ({
        url: `/Auth/activate-account/${otp}`,
        method: 'POST',
        data: { otp },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          
          if (data.success) {
            
            const { auth } = getState();
            const tempPassword = sessionStorage.getItem('tempPassword');
                       
            if (auth.tempEmail && tempPassword) {
              
              try {
                const loginResult = await dispatch(authApi.endpoints.login.initiate({
                  email: auth.tempEmail,
                  password: tempPassword
                })).unwrap();
                                
                sessionStorage.removeItem('tempPassword');
                
              } catch (loginError) {
                sessionStorage.removeItem('tempPassword');
                throw new Error('Auto-login failed after OTP verification');
              }
            } else {
              console.warn('⚠️ Missing email or password for auto-login');
              throw new Error('Missing credentials for auto-login');
            }
          }
        } catch (error) {
          console.error('❌ OTP verification failed:', error);
          sessionStorage.removeItem('tempPassword');
          throw error;
        }
      },
    }),
    
    resendOtp: builder.mutation({
      query: () => ({
        url: '/Auth/resend-register-otp',
        method: 'POST',
      }),
    }),
    
    login: builder.mutation({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        data: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
                    
          if (data.content.status === 'Inactive') {
            dispatch(setTempToken({
              token: data.content.token,
              email: data.content.email,
              userId: data.content.userId,
              needsActivation: true,
            }));
            return;
          }
          
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
          console.error('Login mutation failed:', error);
          throw error;
        }
      },
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/Auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
          sessionStorage.removeItem('tempPassword');
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