import { apiSlice } from '../api/apiSlice';

export const stationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /Station?page=&pageSize=&search=  (no auth required)
    getStations: builder.query({
      query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
        url: '/Station',
        method: 'GET',
        params: {
          page,
          pageSize,
          search,
        },
      }),
      providesTags: ['Station'],
    }),

    // POST /Station  (requires token)
    createStation: builder.mutation({
      // args: { station: { name,address,latitude,longitude,isActive }, token }
      query: ({ station, token }) => ({
        url: '/Station',
        method: 'POST',
        data: station,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: ['Station'],
    }),

    // PUT /Station/{id}
    updateStation: builder.mutation({
      query: ({ id, station, token }) => ({
        url: `/Station/${id}`,
        method: 'PUT',
        data: station,
      }),
      invalidatesTags: ['Station'],
    }),

    // DELETE /Station/{id}
    deleteStation: builder.mutation({
      query: ({ id, token }) => ({
        url: `/Station/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Station'],
    }),
    //GET /Station/available/{batteryTypeId} 
      getStationsByBatteryType: builder.query({
      query: ({batteryTypeId, excludeFull = true}) => ({
        url: `/Station/available/`,
        method: 'GET',
        params: {
          batteryTypeId,
          excludeFull
        },

      }),
      providesTags: ['Station'],
    }),
  }),
 
});

export const {
  useGetStationsQuery,
  useCreateStationMutation,
  useUpdateStationMutation,
  useDeleteStationMutation,
  useGetStationsByBatteryTypeQuery
} = stationApi;
