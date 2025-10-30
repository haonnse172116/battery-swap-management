import { apiSlice } from '../api/apiSlice';

export const batterySwapApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /me - Get user's battery swaps
    getMySwaps: builder.query({
      query: () => ({
        url: `/BatterySwap/my-swaps`,
        method: 'GET',
      }),
      providesTags: ['BatterySwap'],
    }),
    
    // ✅ GET /BatterySwap/{id} - Get specific swap by ID
    getSwapById: builder.query({
      query: (swapId) => ({
        url: `/BatterySwap/${swapId}`,
        method: 'GET',
      }),
      providesTags: (result, error, swapId) => [
        { type: 'BatterySwap', id: swapId }
      ],
    }),
    
    // ✅ POST /BatterySwap - Create new swap (if needed)
    createSwap: builder.mutation({
      query: (swapData) => ({
        url: `/BatterySwap`,
        method: 'POST',
        data: swapData,
      }),
      invalidatesTags: ['BatterySwap'],
    }),
  }),
});

export const {
  useGetMySwapsQuery,
  useGetSwapByIdQuery,
  useCreateSwapMutation,
} = batterySwapApi;