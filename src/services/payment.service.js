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
  }),
});

export const { useInitPaymentMutation, useGetPaymentByIdQuery } = paymentApi;

export default paymentApi;
