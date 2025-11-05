import { apiSlice } from '../api/apiSlice';

export const staffManagementBatteryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /staff/swaps?page=&pageSize=&stationId=&status=&search=
    getStaffSwapsByStationId: builder.query({
      query: ({ page = 1, pageSize = 10, stationId = '', status = '', search = '' } = {}) => ({
        url: '/staff/swaps',
        method: 'GET',
        params: { page, pageSize, stationId, status, search },
      }),
      providesTags: (result) =>
        result?.content ? result.content.map((r) => ({ type: 'StaffSwap', id: r.swapId })) : [{ type: 'StaffSwap', id: 'LIST' }],
    }),

    // PUT /staff/swaps/{swapId}/reject
    rejectSwap: builder.mutation({
      query: ({ swapId, reason, token } = {}) => ({
        url: `/staff/swaps/${swapId}/reject`,
        method: 'PUT',
        data: { reason },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'StaffSwap', id: arg?.swapId }, { type: 'StaffSwap', id: 'LIST' }],
    }),

    // PUT /staff/swaps/{swapId}/confirm
    confirmSwap: builder.mutation({
      query: ({ swapId, token } = {}) => ({
        url: `/staff/swaps/${swapId}/confirm`,
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'StaffSwap', id: arg?.swapId }, { type: 'StaffSwap', id: 'LIST' }],
    }),

    // PUT /staff/swaps/{swapId}/completed
    completedSwap: builder.mutation({
      query: ({ swapId, token } = {}) => ({
        url: `/staff/swaps/${swapId}/completed`,
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'StaffSwap', id: arg?.swapId }, { type: 'StaffSwap', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetStaffSwapsByStationIdQuery,
  useRejectSwapMutation,
  useConfirmSwapMutation,
  useCompletedSwapMutation,
} = staffManagementBatteryApi;

export default staffManagementBatteryApi;
