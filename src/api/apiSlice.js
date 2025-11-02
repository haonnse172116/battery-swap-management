import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: [
    'User',
    'Vehicle',
    'Battery',
    'BatteryType',
    'Station',
    'Booking',
    'Payment',
    'Transaction',
    'Subscription',
    'SubscriptionPayment',
    'Inventory',
    'BatterySwap',
    'SupportTicket',
    'Notification',
    'Dashboard',
    'Review',
  ],
  endpoints: () => ({}),
});

export default apiSlice;