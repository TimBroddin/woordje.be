import { createSlice } from "@reduxjs/toolkit";

const initialState = { visible: true };

export const installPopupSlice = createSlice({
  name: "installPopup",
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
export const { hide, show } = installPopupSlice.actions;

export default installPopupSlice.reducer;
