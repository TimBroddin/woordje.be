import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  WORD_LENGTH: 6,
  BOARD_SIZE: 7,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setWordSize: (state, action) => {
      state.WORD_LENGTH = action.value;
    },
    setBoardSize: (state, action) => {
      state.BOARD_SIZE = action.value;
    },
    setSettings: (state, action) => {
      const { WORD_LENGTH, BOARD_SIZE } = action.payload;
      state.WORD_LENGTH = WORD_LENGTH;
      state.BOARD_SIZE = BOARD_SIZE;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSettings, setWordSize, setBoardSize } = settingsSlice.actions;

export default settingsSlice.reducer;
