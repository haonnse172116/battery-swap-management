import { apiSlice } from "../api/apiSlice";

export const batteryTypeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========== GET ALL BATTERY TYPES ==========
    getAllBatteryTypes: builder.query({
      query: ({ page = 1, pageSize = 100 } = {}) => ({
        url: '/BatteryType',
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['BatteryType'],
      transformResponse: (response) => {
        return {
          batteryTypes: response.content?.map(type => ({
            batteryTypeId: type.batteryTypeId,
            batteryTypeName: type.batteryTypeName,
            // Display format
            typeName: type.batteryTypeName,
            displayName: `${type.batteryTypeName} (${type.batteryTypeId})`,
          })) || [],
          pagination: response.pagination,
        };
      },
    }),

    // ========== GET BATTERY TYPE DETAIL ==========
    getBatteryTypeDetail: builder.query({
      query: (batteryTypeId) => ({
        url: `/BatteryType/${batteryTypeId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'BatteryType', id }],
      transformResponse: (response) => {
        const type = response.content;
        return {
          batteryTypeId: type.batteryTypeId,
          batteryTypeName: type.batteryTypeName,
          typeName: type.batteryTypeName,
          displayName: `${type.batteryTypeName} (${type.batteryTypeId})`,
        };
      },
    }),

    // ========== CREATE BATTERY TYPE (Admin) ==========
    createBatteryType: builder.mutation({
      query: (data) => ({
        url: '/BatteryType',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['BatteryType'],
    }),

    // ========== UPDATE BATTERY TYPE (Admin) ==========
    updateBatteryType: builder.mutation({
      query: ({ batteryTypeId, ...data }) => ({
        url: `/BatteryType/${batteryTypeId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { batteryTypeId }) => [
        'BatteryType',
        { type: 'BatteryType', id: batteryTypeId },
      ],
    }),

    // ========== DELETE BATTERY TYPE (Admin) ==========
    deleteBatteryType: builder.mutation({
      query: (batteryTypeId) => ({
        url: `/BatteryType/${batteryTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BatteryType'],
    }),
  }),
});

export const {
  useGetAllBatteryTypesQuery,
  useGetBatteryTypeDetailQuery,
  useCreateBatteryTypeMutation,
  useUpdateBatteryTypeMutation,
  useDeleteBatteryTypeMutation,
} = batteryTypeApi;