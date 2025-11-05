import { apiSlice } from '../api/apiSlice';

export const stationStaffApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /StationStaff/assign
     * body: { stationId, userId }
     */
    assignStationStaff: builder.mutation({
      query: ({ stationId, userId } = {}) => ({
        url: '/StationStaff/assign',
        method: 'POST',
        data: { stationId, userId },
      }),
      invalidatesTags: (result, error, arg) => [
        // invalidate lists for this station so UI refreshes
        { type: 'StationStaff', id: `STATION_${arg?.stationId}` },
        'StationStaff',
      ],
    }),

    /**
     * DELETE /StationStaff/{stationStaffId}
     */
    deleteStationStaff: builder.mutation({
      query: ({ stationStaffId } = {}) => ({
        url: `/StationStaff/${stationStaffId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [
        'StationStaff',
      ],
    }),

    /**
     * GET /StationStaff/station/{stationId}?page=&pageSize=&search=
     */
    getStationStaffByStation: builder.query({
      query: ({ stationId, page = 1, pageSize = 10, search = '' } = {}) => ({
        url: `/StationStaff/station/${stationId}`,
        method: 'GET',
        params: { page, pageSize, search },
      }),
      providesTags: (result, error, arg) =>
        result?.content
          ? [
              ...result.content.map((r) => ({ type: 'StationStaff', id: r.stationStaffId || r.id })),
              { type: 'StationStaff', id: `STATION_${arg.stationId}` },
            ]
          : [{ type: 'StationStaff', id: `STATION_${arg?.stationId}` }],
    }),

    /**
     * GET /StationStaff/user/{userId}
     */
    getStationStaffByUserId: builder.query({
      query: ({ userId } = {}) => ({
        url: `/StationStaff/user/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [
        { type: 'StationStaff', id: `USER_${arg?.userId}` },
        'StationStaff',
      ],
    }),

    /**
     * GET /StationStaff/station/{stationId}/all
     * returns all staff for a station (no pagination)
     */
    getAllStationStaffByStation: builder.query({
      query: (stationId) => ({
        url: `/StationStaff/station/${stationId}/all`,
        method: 'GET',
      }),
      providesTags: (result, error, stationId) =>
        result?.length
          ? [
              ...result.map((r) => ({ type: 'StationStaff', id: r.stationStaffId || r.id })),
              { type: 'StationStaff', id: `STATION_${stationId}` },
            ]
          : [{ type: 'StationStaff', id: `STATION_${stationId}` }],
    }),
  }),
});

export const {
  useAssignStationStaffMutation,
  useDeleteStationStaffMutation,
  useGetStationStaffByStationQuery,
  useGetStationStaffByUserIdQuery,
  useGetAllStationStaffByStationQuery,
} = stationStaffApi;
