import { createSlice } from "@reduxjs/toolkit";

const initialState = { currentModal: "splash" };

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    hide: (state, { payload }) => {
      state.currentModal = false;
    },
    setModal: (state, { payload }) => {
      state.currentModal = payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { hide, setModal } = modalSlice.actions;

export default modalSlice.reducer;
