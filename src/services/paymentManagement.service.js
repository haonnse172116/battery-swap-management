// src/services/paymentManagement.service.js
import { apiSlice } from '../api/apiSlice';

export const paymentManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /PaymentManagement/all
    getPaymentManagementAll: builder.query({
      query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
        url: '/PaymentManagement/all',
        method: 'GET',
        params: { page, pageSize, search },
      }),
      providesTags: (result, error, arg) =>
        result?.content
          ? [
              ...result.content.map((item) => ({ type: 'PaymentManagement', id: item.paymentId || item.id })),
              { type: 'PaymentManagement', id: 'LIST' },
            ]
          : [{ type: 'PaymentManagement', id: 'LIST' }],
    }),

    // GET /PaymentManagement/station/{stationId}
    getPaymentManagementByStation: builder.query({
      query: ({ stationId, page = 1, pageSize = 10, search = '' } = {}) => ({
        url: `/PaymentManagement/station/${stationId}`,
        method: 'GET',
        params: { page, pageSize, search },
      }),
      providesTags: (result, error, arg) =>
        result?.content
          ? [
              ...result.content.map((item) => ({ type: 'PaymentManagement', id: item.paymentId || item.id })),
              { type: 'PaymentManagement', id: `STATION_${arg?.stationId}` },
            ]
          : [{ type: 'PaymentManagement', id: `STATION_${arg?.stationId}` }],
    }),
  }),
});

export const {
  useGetPaymentManagementAllQuery,
  useGetPaymentManagementByStationQuery,
} = paymentManagementApi;

export default paymentManagementApi;
