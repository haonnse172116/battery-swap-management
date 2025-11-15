import { apiSlice } from '../api/apiSlice';

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /Subscription/by-user/me - Get current user subscription
    getMySubscription: builder.query({
      query: () => ({
        url: '/Subscription/by-user/me',
        method: 'GET',
      }),
      providesTags: ['UserSubscription'],
    }),

    // GET /Subscription/by-user/{userId} - Get user subscription by ID (admin)
    getUserSubscription: builder.query({
      query: (userId) => ({
        url: `/Subscription/by-user/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [
        { type: 'UserSubscription', id: userId }
      ],
    }),

    // GET /Subscription/by-user/{userId} - Get user subscription by ID (admin)
    getSubscriptionPurchases: builder.query({
      query: (userId) => ({
        url: `/Subscription/purchases`,
        method: 'GET',
      }),
      providesTags: ['UserSubscription'],
    }),
  }),
});

export const {
  useGetMySubscriptionQuery,
  useGetUserSubscriptionQuery,
  useGetSubscriptionPurchasesQuery,
} = subscriptionApi;