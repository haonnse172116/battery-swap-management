import { apiSlice } from "../api/apiSlice";

export const stationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ========== GET ALL STATIONS ==========
    getAllStations: builder.query({
      query: ({ page = 1, pageSize = 100 } = {}) => ({
        url: '/Station',
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['Station'],
      transformResponse: (response) => {
        return {
          stations: response.content?.map(station => ({
            stationId: station.stationId,
            stationName: station.stationName,
            address: station.address,
            latitude: station.latitude,
            longitude: station.longitude,
            status: station.status,
            operatingHours: station.operatingHours,
            // Computed
            name: station.stationName,
            location: {
              lat: station.latitude,
              lng: station.longitude,
            },
          })) || [],
          pagination: response.pagination,
        };
      },
    }),

    // ========== GET STATION DETAIL ==========
    getStationDetail: builder.query({
      query: (stationId) => ({
        url: `/Station/${stationId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Station', id }],
    }),

    // ========== GET BATTERIES AT STATION ==========
    getStationBatteries: builder.query({
      query: (stationId) => ({
        url: `/Station/${stationId}/batteries`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Station', id }],
      transformResponse: (response) => {
        return response.content?.map(battery => ({
          batteryId: battery.batteryId,
          batteryTypeId: battery.batteryTypeId,
          batteryTypeName: battery.batteryTypeName,
          batteryLevel: battery.batteryLevel,
          status: battery.status,
          price: battery.price,
        })) || [];
      },
    }),
  }),
});

export const {
  useGetAllStationsQuery,
  useGetStationDetailQuery,
  useGetStationBatteriesQuery,
} = stationApi;
