import { apiSlice } from "../api/apiSlice";

export const vehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========== GET ALL VEHICLES (Admin/Staff) ==========
    getAllVehicles: builder.query({
      query: ({ page = 1, pageSize = 10, } = {}) => ({
        url: '/Vehicle',
        method: 'GET',
        params: {
          page,
          pageSize,
        },
      }),
      providesTags: ['Vehicle'],
      transformResponse: (response) => {
        return {
          vehicles: response.content?.map(vehicle => ({
            vehicleId: vehicle.vehicleId,
            userId: vehicle.userId,
            userName: vehicle.userName,
            batteryId: vehicle.batteryId,
            batteryTypeId: vehicle.batteryTypeId,
            batteryTypeName: vehicle.batteryTypeName,
            brand: vehicle.vBrand,
            model: vehicle.model,
            licensePlate: vehicle.licensePlate,
            // Computed fields for UI
            name: `${vehicle.vBrand} ${vehicle.model}`,
            batteryType: vehicle.batteryTypeName,
            image: '/vf8.png', // Default image
          })) || [],
          pagination: response.pagination,
        };
      },
    }),

    // ========== GET MY VEHICLES (Driver) ==========
    getMyVehicles: builder.query({
      query: () => ({
        url: '/Vehicle/by-user/me',
        method: 'GET',
      }),
      providesTags: ['Vehicle'],
    }),

    // ========== GET VEHICLE DETAIL ==========
    getVehicleDetail: builder.query({
      query: (vehicleId) => ({
        url: `/Vehicle/${vehicleId}`,
        method: 'GET',
      }),
      providesTags: (result, error, vehicleId) => [{ type: 'Vehicle', id: vehicleId }],
      transformResponse: (response) => {
        const vehicle = response.content;
        return {
          vehicleId: vehicle.vehicleId,
          userId: vehicle.userId,
          userName: vehicle.userName,
          batteryId: vehicle.batteryId,
          batteryTypeId: vehicle.batteryTypeId,
          batteryTypeName: vehicle.batteryTypeName,
          brand: vehicle.vBrand,
          model: vehicle.model,
          licensePlate: vehicle.licensePlate,
          name: `${vehicle.vBrand} ${vehicle.model}`,
          batteryType: vehicle.batteryTypeName,
          image: '/vf8.png',
        };
      },
    }),

    // ========== CREATE VEHICLE ==========
    createVehicle: builder.mutation({
      query: (vehicleData) => ({
        url: '/Vehicle',
        method: 'POST',
        data: vehicleData,
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // ========== UPDATE VEHICLE ==========
    updateVehicle: builder.mutation({
      query: ({ vehicleId, ...data }) => ({
        url: `/Vehicle/${vehicleId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { vehicleId }) => [
        'Vehicle',
        { type: 'Vehicle', id: vehicleId },
      ],
    }),

    // ========== DELETE VEHICLE ==========
    deleteVehicle: builder.mutation({
      query: (vehicleId) => ({
        url: `/Vehicle/${vehicleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useGetAllVehiclesQuery,
  useGetMyVehiclesQuery,
  useGetVehicleDetailQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;