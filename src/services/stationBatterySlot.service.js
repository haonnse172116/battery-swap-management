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
        data: slotData,
      }),
      invalidatesTags: ['StationSlot'],
    }),
    
    updateSlot: builder.mutation({
      query: (slotData) => ({
        url: `/StationBatterySlot`,
        method: 'PUT',
        data: slotData,
      }),
      invalidatesTags: ['StationSlot'],
    }),
    
    deleteSlot: builder.mutation({
      query: (id) => ({
        url: `/StationBatterySlot/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StationSlot'],
    }),
  }),
});

export const {
  useGetStationSlotsQuery,
  useRegisterSlotMutation,
  useUpdateSlotMutation,
  useDeleteSlotMutation,
} = stationBatterySlotApi;