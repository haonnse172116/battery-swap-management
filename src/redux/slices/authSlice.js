import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.accessToken = payload.tokenResponse.accessToken;
      state.role = payload.tokenResponse.user.role;
      state.user = payload.tokenResponse.user;
    },
    logout: () => initialState,
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
