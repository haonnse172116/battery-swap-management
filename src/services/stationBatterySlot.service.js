import { apiSlice } from '../api/apiSlice';

export const stationBatterySlotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStationSlots: builder.query({
      query: (stationId) => ({
        url: `/StationBatterySlot/station/${stationId}`,
        method: 'GET',
      }),
      providesTags: ['StationSlot'],
    }),
    
    registerSlot: builder.mutation({
      query: (slotData) => ({
        url: `/StationBatterySlot`,
        method: 'POST',
        body: slotData,
      }),
      invalidatesTags: ['StationSlot'],
    }),
  }),
});

export const {
  useGetStationSlotsQuery,
  useRegisterSlotMutation,
} = stationBatterySlotApi;