import { apiSlice } from "../api/apiSlice";

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBookings: builder.query({
      query: ({ 
        page = 1, 
        pageSize = 10, 
        status, 
        stationId,
        startDate, 
        endDate,
        search 
      } = {}) => ({
        url: '/Booking',
        method: 'GET',
        params: {
          page,
          pageSize,
          status,
          stationId,
          startDate,
          endDate,
          search,
        },
      }),
      providesTags: ['Booking'],
      transformResponse: (response) => {
        return {
          bookings: response.content?.map(booking => ({
            bookingId: booking.bookingId,
            userId: booking.userId,
            userName: booking.userName,
            vehicleId: booking.vehicleId,
            vehicleName: booking.vehicleName,
            licensePlate: booking.licensePlate,
            stationId: booking.stationId,
            stationName: booking.stationName,
            stationAddress: booking.stationAddress,
            bookingTime: booking.bookingTime,
            status: booking.status,
            price: booking.price,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          })) || [],
          pagination: response.pagination,
        };
      },
    }),

    getMyBookings: builder.query({
      query: ({ 
        page = 1, 
        pageSize = 10, 
        status,
        startDate,
        endDate 
      } = {}) => ({
        url: '/Booking/my-bookings',
        method: 'GET',
        params: {
          page,
          pageSize,
          status,
          startDate,
          endDate,
        },
      }),
      providesTags: ['Booking'],
      transformResponse: (response) => {
        return response.content?.map(booking => ({
          bookingId: booking.bookingId,
          userId: booking.userId,
          userName: booking.userName,
          vehicleId: booking.vehicleId,
          vehicleName: booking.vehicleName,
          licensePlate: booking.licensePlate,
          stationId: booking.stationId,
          stationName: booking.stationName,
          stationAddress: booking.stationAddress,
          bookingTime: booking.bookingTime,
          status: booking.status,
          price: booking.price,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        })) || [];
      },
    }),

    getBookingDetail: builder.query({
      query: (bookingId) => ({
        url: `/Booking/${bookingId}`,
        method: 'GET',
      }),
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
      transformResponse: (response) => {
        const booking = response.content;
        return {
          bookingId: booking.bookingId,
          userId: booking.userId,
          userName: booking.userName,
          vehicleId: booking.vehicleId,
          vehicleName: booking.vehicleName,
          licensePlate: booking.licensePlate,
          stationId: booking.stationId,
          stationName: booking.stationName,
          stationAddress: booking.stationAddress,
          bookingTime: booking.bookingTime,
          status: booking.status,
          price: booking.price,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };
      },
    }),

    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/Booking',
        method: 'POST',
        data: {
          vehicleId: bookingData.vehicleId,
          stationId: bookingData.stationId,
          bookingTime: bookingData.bookingTime,
        },
      }),
      invalidatesTags: ['Booking'],
      transformResponse: (response) => {
        return {
          bookingId: response.content?.bookingId,
          message: response.message || 'Booking created successfully',
        };
      },
    }),

    updateBookingStatus: builder.mutation({
      query: ({ bookingId, status }) => ({
        url: `/Booking/${bookingId}/status`,
        method: 'PUT',
        data: { status },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        'Booking',
        { type: 'Booking', id: bookingId },
      ],
    }),

    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/Booking/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, bookingId) => [
        'Booking',
        { type: 'Booking', id: bookingId },
      ],
    }),

    confirmBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/Booking/${bookingId}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, bookingId) => [
        'Booking',
        { type: 'Booking', id: bookingId },
      ],
    }),

    rejectBooking: builder.mutation({
      query: ({ bookingId, reason }) => ({
        url: `/Booking/${bookingId}/reject`,
        method: 'POST',
        data: { reason },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        'Booking',
        { type: 'Booking', id: bookingId },
      ],
    }),

    getStationAvailability: builder.query({
      query: ({ stationId, date }) => ({
        url: `/Station/available`,
        method: 'GET',
        params: {
          stationId,
          date,
        },
      }),
      providesTags: (result, error, { stationId }) => [
        { type: 'StationAvailability', id: stationId }
      ],
    }),

    getStationAvailabilityRange: builder.query({
      query: ({ stationId, startDate, endDate }) => ({
        url: `/Station/available`,
        method: 'GET',
        params: {
          stationId,
          startDate,
          endDate,
        },
      }),
      providesTags: (result, error, { stationId }) => [
        { type: 'StationAvailability', id: stationId }
      ],
    }),

    getAvailableTimeSlots: builder.query({
      query: ({ stationId, date }) => ({
        url: `/Booking/available-slots`,
        method: 'GET',
        params: {
          stationId,
          date,
        },
      }),
      providesTags: (result, error, { stationId, date }) => [
        { type: 'TimeSlots', id: `${stationId}-${date}` }
      ],
    }),

    getBookingPrice: builder.query({
      query: ({ vehicleId, stationId }) => ({
        url: `/Booking/price`,
        method: 'GET',
        params: {
          vehicleId,
          stationId,
        },
      }),
    }),

    processPayment: builder.mutation({
      query: ({ bookingId, paymentMethod, paymentData }) => ({
        url: `/Booking/${bookingId}/payment`,
        method: 'POST',
        data: {
          paymentMethod,
          ...paymentData,
        },
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        'Booking',
        { type: 'Booking', id: bookingId },
      ],
    }),
  }),
});

export const {
  useGetAllBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingDetailQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useRejectBookingMutation,
  useGetStationAvailabilityQuery,
  useGetStationAvailabilityRangeQuery,
  useGetAvailableTimeSlotsQuery,
  useGetBookingPriceQuery,
  useProcessPaymentMutation,
} = bookingApi;