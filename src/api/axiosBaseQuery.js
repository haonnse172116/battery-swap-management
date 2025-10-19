import axiosInstance from "./axiosInstance";

/**
 * axiosBaseQuery for RTK Query
 * @param {Object} config
 * @param {string} config.baseUrl - Base URL for API
 * @returns {Function} BaseQuery function
 */
const axiosBaseQuery =
  ({ baseUrl = "" } = {}) =>
  async ({ url, method = "get", data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const error = axiosError;
      const backendData = error.response?.data || {};

      return {
        error: {
          status: error.response?.status ?? 500,
          data: {
            errorCode: backendData.errorCode ?? "UNKNOWN_ERROR",
            errorMessage: backendData.errorMessage ?? error.message,
          },
        },
      };
    }
  };

export default axiosBaseQuery;