import { apiSlice } from '../api/apiSlice';

export const batteryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /Battery?page=&pageSize=&search=
        getAllBatteries: builder.query({
            query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
                url: '/Battery',
                method: 'GET',
                params: { page, pageSize, search },
            }),
            providesTags: (result) =>
                result?.content
                    ? result.content.map((b) => ({ type: 'Battery', id: b.id || b.batteryId }))
                    : [{ type: 'Battery', id: 'LIST' }],
        }),

        // GET /Battery/station/{stationId}?page=&pageSize=&search=
        getBatteriesByStation: builder.query({
            query: ({ stationId, page = 1, pageSize = 10, search = '' } = {}) => ({
                url: `/Battery/station/${stationId}`,
                method: 'GET',
                params: { page, pageSize, search },
            }),
            providesTags: (result, error, arg) =>
                result?.content ? [...result.content.map((r) => ({ type: 'Battery', id: r.id || r.batteryId })), { type: 'Battery', id: `STATION_${arg.stationId}` }] : [{ type: 'Battery', id: `STATION_${arg.stationId}` }],
        }),

        // POST /Battery
        createBattery: builder.mutation({
            query: ({ battery, token } = {}) => ({
                url: '/Battery',
                method: 'POST',
                data: battery,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Battery', id: `STATION_${arg?.battery?.stationId}` }],
        }),

        // PUT /Battery
        updateBattery: builder.mutation({
            query: ({ battery, token } = {}) => ({
                url: '/Battery',
                method: 'PUT',
                data: battery,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Battery', id: `STATION_${arg?.battery?.stationId}` }],
        }),

        // DELETE /Battery/{id}
        deleteBattery: builder.mutation({
            query: ({ id, token } = {}) => ({
                url: `/Battery/${id}`,
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Battery', id: arg?.id }],
        }),

        // POST /Battery/station/bulk
        assignBatteriesToStation: builder.mutation({
            query: ({ data, token } = {}) => ({
                url: '/Battery/station/bulk',
                method: 'POST',
                data, // mảng [{ stationId, batteryIds: [] }]
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
            invalidatesTags: (result) => [{ type: 'Battery', id: 'LIST' }],
        }),

        // ✅ GET /Battery/unassigned?batteryTypeId= (optional parameter)
        getUnassignedBatteries: builder.query({
            query: ({ batteryTypeId } = {}) => ({
                url: '/Battery/unassigned',
                params: batteryTypeId ? { batteryTypeId } : {},
            }),
            providesTags: ['Battery'],
        }),
    
        // POST /Battery/attach
        attachBattery: builder.mutation({
            query: ({ batteryId, vehicleId, performByUserId }) => ({
                url: '/Battery/attach',
                method: 'POST',
                data: { batteryId, vehicleId, performByUserId },
            }),
            invalidatesTags: ['Battery', 'Vehicle'],
        }),

    }),
});

export const {
    useGetAllBatteriesQuery,
    useGetBatteriesByStationQuery,
    useCreateBatteryMutation,
    useUpdateBatteryMutation,
    useDeleteBatteryMutation,
    useAssignBatteriesToStationMutation,
    useGetUnassignedBatteriesQuery, // ✅ Now supports optional batteryTypeId parameter
    useAttachBatteryMutation,
} = batteryApi;
