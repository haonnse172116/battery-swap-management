import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
  role: null,
  // Temp token cho OTP flow
  tempToken: null,
  tempEmail: null,
  tempUserId: null,
  needsActivation: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      const { accessToken, user } = payload;
      state.accessToken = accessToken;
      state.user = user;
      state.role = user?.role || null;
      // Clear temp data
      state.tempToken = null;
      state.tempEmail = null;
      state.tempUserId = null;
      state.needsActivation = false;
    },

    setTempToken: (state, { payload }) => {
      state.tempToken = payload.token;
      state.tempEmail = payload.email;
      state.tempUserId = payload.userId;
      state.needsActivation = payload.needsActivation || false;
    },

    clearTempToken: (state) => {
      state.tempToken = null;
      state.tempEmail = null;
      state.tempUserId = null;
      state.needsActivation = false;
    },

    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.role = null;
      state.tempToken = null;
      state.tempEmail = null;
      state.tempUserId = null;
      state.needsActivation = false;
    },
  },
});

export const { setCredentials, setTempToken, clearTempToken, logout } = authSlice.actions;
export default authSlice.reducer;
