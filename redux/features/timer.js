import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  start: 0,
  value: 0,
};

export const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    reset: (state) => {
      state.value = 0;
      state.start = 0;
    },
    start: (state) => {
      state.value = 0;
      state.start = new Date().getTime();
    },
    stop: (state) => {
      state.value = new Date().getTime() - state.start;
    },
  },
});

// Action creators are generated for each case reducer function
export const { start, stop, reset } = timerSlice.actions;

export default timerSlice.reducer;
