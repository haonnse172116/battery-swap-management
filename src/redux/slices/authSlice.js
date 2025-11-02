import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
  role: null,
  tempToken: null,
  tempEmail: null,
  tempUserId: null,
  needsActivation: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.role = user?.role || null;
      // Clear temp data
      state.tempToken = null;
      state.tempEmail = null;
      state.tempUserId = null;
      state.needsActivation = false;
    },
    setTempToken: (state, action) => {
      const { token, email, userId, needsActivation, role } = action.payload;
      state.tempToken = token;
      state.tempEmail = email;
      state.tempUserId = userId;
      state.needsActivation = needsActivation || false;
      if (role) state.role = role; 
    },
    clearTemp: (state) => {
      state.tempToken = null;
      state.tempEmail = null;
      state.tempUserId = null;
      state.needsActivation = false;
    },
    logout: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setCredentials, setTempToken, clearTemp, logout } = authSlice.actions;
export default authSlice.reducer;
