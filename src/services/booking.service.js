import { apiSlice } from '../api/apiSlice';

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /Booking/me - Get user's bookings
    getMyBookings: builder.query({
      query: () => ({
        url: `/Booking/me`,
        method: 'GET',
      }),
      providesTags: ['Booking'],
    }),

    // GET /Booking/{id} - Get specific booking by ID
    getBookingById: builder.query({
      query: (bookingId) => ({
        url: `/Booking/${bookingId}`,
        method: 'GET',
      }),
      providesTags: (result, error, bookingId) => [
        { type: 'Booking', id: bookingId },
      ],
    }),

    // POST /Booking - Create new booking
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: `/Booking`,
        method: 'POST',
        data: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),

    // GET /api/Booking - Get all bookings (with pagination + search)
    getAllBookings: builder.query({
      query: ({ page = 1, size = 10, search = '' } = {}) => ({
        url: `/Booking`,
        method: 'GET',
        params: { page, size, search },
      }),
      providesTags: ['Booking'],
    }),

    // GET /api/Booking/station/{stationId}/pending
    getPendingBookingsByStation: builder.query({
      query: ({ stationId, page = 1, size = 10, search = '', status = 'Pending' }) => ({
        url: `/Booking/station/${stationId}/pending`,
        method: 'GET',
        params: { page, size, search, status },
      }),
      providesTags: (result, error, { stationId }) => [
        { type: 'Booking', id: `Station-${stationId}` },
      ],
    }),

    // PUT /api/Booking/{bookingId}/reject
    rejectBooking: builder.mutation({
      query: ({ bookingId, reason }) => ({
        url: `/Booking/${bookingId}/reject`,
        method: 'PUT',
        data: { reason },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'Booking', id: bookingId },
        'Booking',
      ],
    }),

    // PUT /api/Booking/{bookingId}/confirm
    confirmBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/Booking/${bookingId}/confirm`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, bookingId) => [
        { type: 'Booking', id: bookingId },
        'Booking',
      ],
    
    // ✅ POST /Booking/estimate-price - Get estimated price
    getEstimatedPrice: builder.mutation({
      query: ({ vehicleId, stationId }) => ({
        url: `/Booking/estimate-price`,
        method: 'POST',
        data: {
          vehicleId,
          stationId
        },
      }),
      // Don't cache this as price may change frequently
    }),
  }),
});

export const {
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useGetAllBookingsQuery,
  useGetPendingBookingsByStationQuery,
  useRejectBookingMutation,
  useConfirmBookingMutation,
  useGetEstimatedPriceMutation,
} = bookingApi;