import { apiSlice } from '../api/apiSlice';

export const batteryService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBatteries: builder.query({
      query: ({ page = 1, pageSize = 10, stationId = null, status = null } = {}) => ({
        url: '/Battery',
        method: 'GET',
        params: {
          page,
          pageSize,
          ...(stationId && { stationId }),
          ...(status && { status }),
        },
      }),
      providesTags: ['Battery'],
    }),

    // Get single battery by ID
    getBattery: builder.query({
      query: (id) => ({
        url: `/Battery/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Battery', id }],
    }),

    // Get battery by serial number
    getBatteryBySerial: builder.query({
      query: (serialNo) => ({
        url: `/Battery/serial/${serialNo}`,
        method: 'GET',
      }),
      providesTags: (result, error, serialNo) => [{ type: 'Battery', id: serialNo }],
    }),

    // Get batteries by station
    getBatteriesByStation: builder.query({
      query: ({ stationId, page = 1, pageSize = 10, status = null } = {}) => ({
        url: `/Battery/station/${stationId}`,
        method: 'GET',
        params: {
          page,
          pageSize,
          ...(status && { status }),
        },
      }),
      providesTags: (result, error, { stationId }) => [
        { type: 'Battery', id: `station-${stationId}` }
      ],
    }),

    // Get batteries in storage by station
    getBatteriesInStorage: builder.query({
      query: ({ stationId, page = 1, pageSize = 10, status = null } = {}) => ({
        url: `/Battery/station/${stationId}/storage`,
        method: 'GET',
        params: {
          page,
          pageSize,
          ...(status && { status }),
        },
      }),
      providesTags: (result, error, { stationId }) => [
        { type: 'Battery', id: `storage-${stationId}` }
      ],
    }),

    // Get available batteries
    getAvailableBatteries: builder.query({
      query: (batteryTypeId = null) => ({
        url: '/Battery/available',
        method: 'GET',
        params: {
          ...(batteryTypeId && { batteryTypeId }),
        },
      }),
      providesTags: ['Battery'],
    }),

    // Create new battery
    createBattery: builder.mutation({
      query: (batteryData) => ({
        url: '/Battery',
        method: 'POST',
        data: {
          serialNo: batteryData.serialNo,
          owner: batteryData.owner || 'Station', // 'Station' or 'Driver'
          status: batteryData.status || 'Available', // 'Available', 'InUse', 'Charging', 'Maintenance', 'Damaged'
          voltage: batteryData.voltage,
          capacityWh: batteryData.capacityWh,
          imageUrl: batteryData.imageUrl || null,
          stationId: batteryData.stationId || null,
          batteryTypeId: batteryData.batteryTypeId,
        },
      }),
      invalidatesTags: ['Battery'],
    }),

    // Update battery
    updateBattery: builder.mutation({
      query: ({ batteryId, ...batteryData }) => ({
        url: '/Battery',
        method: 'PUT',
        data: {
          batteryId,
          serialNo: batteryData.serialNo,
          owner: batteryData.owner,
          status: batteryData.status,
          voltage: batteryData.voltage,
          capacityWh: batteryData.capacityWh,
          imageUrl: batteryData.imageUrl,
          stationId: batteryData.stationId,
          batteryTypeId: batteryData.batteryTypeId,
        },
      }),
      invalidatesTags: (result, error, { batteryId }) => [
        { type: 'Battery', id: batteryId },
        'Battery'
      ],
    }),

    // Delete battery
    deleteBattery: builder.mutation({
      query: (id) => ({
        url: `/Battery/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Battery'],
    }),

    // Station Battery Slot Management

    // Get all battery slots
    getAllBatterySlots: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: '/StationBatterySlot',
        method: 'GET',
        params: {
          page,
          pageSize,
        },
      }),
      providesTags: ['BatterySlot'],
    }),

    // Get battery slot by ID
    getBatterySlot: builder.query({
      query: (id) => ({
        url: `/StationBatterySlot/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'BatterySlot', id }],
    }),

    // Get battery slots by station
    getBatterySlotsByStation: builder.query({
      query: ({ stationId, page = 1, pageSize = 50 } = {}) => ({
        url: `/StationBatterySlot/station/${stationId}`,
        method: 'GET',
        params: {
          page,
          pageSize,
        },
      }),
      providesTags: (result, error, { stationId }) => [
        { type: 'BatterySlot', id: `station-${stationId}` }
      ],
    }),

    // Get all battery slot details
    getAllBatterySlotDetails: builder.query({
      query: () => ({
        url: '/StationBatterySlot/details/all',
        method: 'GET',
      }),
      providesTags: ['BatterySlot'],
    }),

    // Create battery slot
    createBatterySlot: builder.mutation({
      query: (slotData) => ({
        url: '/StationBatterySlot',
        method: 'POST',
        data: {
          stationId: slotData.stationId,
          slotNumber: slotData.slotNumber,
          batteryId: slotData.batteryId || null,
          status: slotData.status || 'Empty_slot', // 'Empty_slot', 'Full_slot'
          batteryTypeId: slotData.batteryTypeId,
        },
      }),
      invalidatesTags: ['BatterySlot', 'Battery'],
    }),

    // Update battery slot (assign/remove battery)
    updateBatterySlot: builder.mutation({
      query: ({ slotId, ...slotData }) => ({
        url: '/StationBatterySlot',
        method: 'PUT',
        data: {
          slotId,
          stationId: slotData.stationId,
          slotNumber: slotData.slotNumber,
          batteryId: slotData.batteryId,
          status: slotData.status,
          batteryTypeId: slotData.batteryTypeId,
        },
      }),
      invalidatesTags: (result, error, { slotId, stationId }) => [
        { type: 'BatterySlot', id: slotId },
        { type: 'BatterySlot', id: `station-${stationId}` },
        'Battery'
      ],
    }),

    // Delete battery slot
    deleteBatterySlot: builder.mutation({
      query: (id) => ({
        url: `/StationBatterySlot/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BatterySlot'],
    }),

    // Staff Inventory Management

    // Get staff inventory summary
    getStaffInventorySummary: builder.query({
      query: (stationId) => ({
        url: '/staff/inventory/summary',
        method: 'GET',
        params: {
          stationId,
        },
      }),
      providesTags: (result, error, stationId) => [
        { type: 'Inventory', id: `summary-${stationId}` }
      ],
    }),

    // Get staff inventory
    getStaffInventory: builder.query({
      query: ({ 
        page = 1, 
        pageSize = 10, 
        stationId = null,
        batteryTypeId = null,
        status = null,
        serialNo = null,
        capacityMin = null,
        capacityMax = null,
        sortBy = null
      } = {}) => ({
        url: '/staff/inventory',
        method: 'GET',
        params: {
          page,
          pageSize,
          ...(stationId && { stationId }),
          ...(batteryTypeId && { batteryTypeId }),
          ...(status && { status }),
          ...(serialNo && { serialNo }),
          ...(capacityMin && { capacityMin }),
          ...(capacityMax && { capacityMax }),
          ...(sortBy && { sortBy }),
        },
      }),
      providesTags: ['Inventory'],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Battery Management
  useGetAllBatteriesQuery,
  useGetBatteryQuery,
  useGetBatteryBySerialQuery,
  useGetBatteriesByStationQuery,
  useGetBatteriesInStorageQuery,
  useGetAvailableBatteriesQuery,
  useCreateBatteryMutation,
  useUpdateBatteryMutation,
  useDeleteBatteryMutation,
  
  // Battery Slot Management
  useGetAllBatterySlotsQuery,
  useGetBatterySlotQuery,
  useGetBatterySlotsByStationQuery,
  useGetAllBatterySlotDetailsQuery,
  useCreateBatterySlotMutation,
  useUpdateBatterySlotMutation,
  useDeleteBatterySlotMutation,
  
  // Staff Inventory
  useGetStaffInventorySummaryQuery,
  useGetStaffInventoryQuery,
} = batteryService;