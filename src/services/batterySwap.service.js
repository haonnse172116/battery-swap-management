import { apiSlice } from '../api/apiSlice';

export const batterySwapApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /BatterySwap/my-swaps
    getMySwaps: builder.query({
      query: () => ({
        url: `/BatterySwap/my-swaps`,
        method: 'GET',
      }),
      providesTags: ['BatterySwap'],
    }),

    // GET /BatterySwap/driver/me
    getDriverSwapHistory: builder.query({
      query: () => ({
        url: `/BatterySwap/driver/me`,
        method: 'GET',
      }),
      providesTags: ['BatterySwap', 'DriverHistory'],
    }),

    // GET /BatterySwap/{id}
    getSwapById: builder.query({
      query: (swapId) => ({
        url: `/BatterySwap/${swapId}`,
        method: 'GET',
      }),
      providesTags: (result, error, swapId) => [{ type: 'BatterySwap', id: swapId }],
    }),

    // GET /BatterySwap/station/{stationId}?page=&pageSize=&search=
    getSwapsByStation: builder.query({
      query: ({ stationId = '', page = 1, pageSize = 10, search = '' } = {}) => ({
        url: `/BatterySwap/station/${stationId}`,
        method: 'GET',
        params: { stationId, page, pageSize, search },
      }),
      providesTags: (result, error, arg) =>
        result?.content
          ? [
              ...result.content.map((s) => ({ type: 'BatterySwap', id: s.id || s.swapId })),
              { type: 'BatterySwap', id: `STATION_${arg.stationId}` },
            ]
          : [{ type: 'BatterySwap', id: `STATION_${arg?.stationId}` }],
    }),

    // POST /BatterySwap/create
    createSwap: builder.mutation({
      query: (swapData) => ({
        url: `/BatterySwap/create`,
        method: 'POST',
        data: swapData,
      }),
      invalidatesTags: (result, error, arg) => [
        'BatterySwap',
        arg?.stationId ? { type: 'BatterySwap', id: `STATION_${arg.stationId}` } : null,
      ].filter(Boolean),
    }),
  }),
});

export const {
  useGetMySwapsQuery,
  useGetDriverSwapHistoryQuery,
  useGetSwapByIdQuery,
  useGetSwapsByStationQuery,
  useCreateSwapMutation,
} = batterySwapApi;
