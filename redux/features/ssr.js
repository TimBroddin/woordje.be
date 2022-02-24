import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const ssrSlice = createSlice({
  name: "ssr",
  initialState,
  reducers: {
    setSsr: (state, { payload }) => {
      state.value = payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSsr } = ssrSlice.actions;

export default ssrSlice.reducer;
