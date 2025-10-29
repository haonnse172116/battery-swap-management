import { apiSlice } from '../api/apiSlice';

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /me - Get user's bookings
    getMyBookings: builder.query({
      query: () => ({
        url: `/Booking/me`,
        method: 'GET',
      }),
      providesTags: ['Booking'],
    }),
    
    // ✅ GET /Booking/{id} - Get specific booking by ID
    getBookingById: builder.query({
      query: (bookingId) => ({
        url: `/Booking/${bookingId}`,
        method: 'GET',
      }),
      providesTags: (result, error, bookingId) => [
        { type: 'Booking', id: bookingId }
      ],
    }),
    
    // ✅ POST /Booking - Create new booking
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: `/Booking`,
        method: 'POST',
        data: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
} = bookingApi;