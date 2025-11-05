import { apiSlice } from '../api/apiSlice';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /Payment/init
    initPayment: builder.mutation({
      query: ({ bookingId, paymentMethod, token } = {}) => ({
        url: '/Payment/init',
        method: 'POST',
        data: { bookingId, paymentMethod },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: ['Payment'],
    }),

    // GET /Payment/{paymentId}
    getPaymentById: builder.query({
      query: ({ paymentId, token } = {}) => ({
        url: `/Payment/${paymentId}`,
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      providesTags: (result, error, arg) => [{ type: 'Payment', id: arg?.paymentId }],
    }),

    // GET /Payment/me-pay - Get current user's payment history
    getMyPayments: builder.query({
      query: ({ page = 1, pageSize = 10, search = '', status = '', sortBy = 'newest' } = {}) => ({
        url: '/Payment/me-pay',
        method: 'GET',
        params: { 
          page, 
          pageSize, 
          search, 
          status,
          sortBy 
        },
      }),
      providesTags: (result, error, arg) =>
        result?.content
          ? [
              ...result.content.map((payment) => ({ type: 'Payment', id: payment.id || payment.paymentId })),
              { type: 'Payment', id: 'MY_PAYMENTS' },
            ]
          : [{ type: 'Payment', id: 'MY_PAYMENTS' }],
    }),
  }),
});

export const { 
  useInitPaymentMutation, 
  useGetPaymentByIdQuery,
  useGetMyPaymentsQuery 
} = paymentApi;

export default paymentApi;
