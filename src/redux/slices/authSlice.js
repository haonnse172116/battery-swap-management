import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
  },
});

export const { increment, decrement } = authSlice.actions;
export default authSlice.reducer;
