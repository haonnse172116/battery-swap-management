import { apiSlice } from '../api/apiSlice';

export const supportTicketApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /SupportTicket?page=&pageSize=&search=
    getSupportTickets: builder.query({
      query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
        url: '/SupportTicket',
        method: 'GET',
        params: {
          page,
          pageSize,
          search,
        },
      }),
      providesTags: (result) =>
        result?.content
          ? [
              ...result.content.map((ticket) => ({ type: 'SupportTicket', id: ticket.ticketId || ticket.id })),
              { type: 'SupportTicket', id: 'LIST' },
            ]
          : [{ type: 'SupportTicket', id: 'LIST' }],
    }),

    // GET /SupportTicket/{id}
    getSupportTicketById: builder.query({
      query: ({ id, token } = {}) => ({
        url: `/SupportTicket/${id}`,
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      providesTags: (result, error, arg) => [{ type: 'SupportTicket', id: arg?.id }],
    }),

    // POST /SupportTicket
    createSupportTicket: builder.mutation({
      // args: { ticket: { ticketId,userId,stationId,subject,message,priority,status }, token }
      query: ({ ticket, token } = {}) => ({
        url: '/SupportTicket',
        method: 'POST',
        data: ticket,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: [{ type: 'SupportTicket', id: 'LIST' }],
    }),

    // PUT /SupportTicket/{id}
    updateSupportTicket: builder.mutation({
      // args: { id, ticket: {...}, token }
      query: ({ id, ticket, token } = {}) => ({
        url: `/SupportTicket/${id}`,
        method: 'PUT',
        data: ticket,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SupportTicket', id },
        { type: 'SupportTicket', id: 'LIST' },
      ],
    }),

    // DELETE /SupportTicket/{id}
    deleteSupportTicket: builder.mutation({
      // args: { id, token }
      query: ({ id, token } = {}) => ({
        url: `/SupportTicket/${id}`,
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      invalidatesTags: [{ type: 'SupportTicket', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketByIdQuery,
  useCreateSupportTicketMutation,
  useUpdateSupportTicketMutation,
  useDeleteSupportTicketMutation,
} = supportTicketApi;

export default supportTicketApi;
