import { apiSlice } from '../api/apiSlice';

export const subscriptionPaymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /SubscriptionPayment/purchase - Create payment
    purchaseSubscription: builder.mutation({
      query: ({ planId, paymentMethod = 'Card' }) => ({
        url: '/SubscriptionPayment/purchase',
        method: 'POST',
        data: { planId, paymentMethod },
      }),
      invalidatesTags: ['SubscriptionPayment', 'UserSubscription'],
    }),

    // GET /SubscriptionPayment/{subPayId} - Get payment details
    getSubscriptionPayment: builder.query({
      query: (subPayId) => ({
        url: `/SubscriptionPayment/${subPayId}`,
        method: 'GET',
      }),
      providesTags: (result, error, subPayId) => [
        { type: 'SubscriptionPayment', id: subPayId }
      ],
    }),

    // GET /SubscriptionPayment/my-payments - Get user's payment history
    getUserPaymentHistory: builder.query({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: `/SubscriptionPayment/my-payments`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['SubscriptionPayment'],
    }),
  }),
});

export const {
  usePurchaseSubscriptionMutation,
  useGetSubscriptionPaymentQuery,
  useGetUserPaymentHistoryQuery,
} = subscriptionPaymentApi;