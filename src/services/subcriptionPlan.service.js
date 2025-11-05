import { apiSlice } from '../api/apiSlice';

export const subscriptionPlanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /SubscriptionPlan - Get all subscription plans
    getSubscriptionPlans: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: '/SubscriptionPlan',
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['SubscriptionPlan'],
    }),

    // GET /SubscriptionPlan/{planId} - Get specific plan
    getSubscriptionPlanById: builder.query({
      query: (planId) => ({
        url: `/SubscriptionPlan/${planId}`,
        method: 'GET',
      }),
      providesTags: (result, error, planId) => [
        { type: 'SubscriptionPlan', id: planId }
      ],
    }),

    // POST /SubscriptionPlan - Create new plan (admin only)
    createSubscriptionPlan: builder.mutation({
      query: (planData) => ({
        url: '/SubscriptionPlan',
        method: 'POST',
        data: planData,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),

    // PUT /SubscriptionPlan/{planId} - Update plan (admin only)
    updateSubscriptionPlan: builder.mutation({
      query: ({ planId, ...planData }) => ({
        url: `/SubscriptionPlan/${planId}`,
        method: 'PUT',
        data: planData,
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'SubscriptionPlan', id: planId },
        'SubscriptionPlan'
      ],
    }),

    // DELETE /SubscriptionPlan/{planId} - Delete plan (admin only)
    deleteSubscriptionPlan: builder.mutation({
      query: (planId) => ({
        url: `/SubscriptionPlan/${planId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanByIdQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = subscriptionPlanApi;