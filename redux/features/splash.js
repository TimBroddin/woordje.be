import { createSlice } from "@reduxjs/toolkit";

const initialState = { visible: true };

export const splashSlice = createSlice({
  name: "splash",
  initialState,
  reducers: {
    hide: (state, { payload }) => {
      state.visible = false;
    },
    show: (state, { payload }) => {
      state.visible = true;
    },
  },
});

// Action creators are generated for each case reducer function
export const { hide, show } = splashSlice.actions;

export default splashSlice.reducer;
