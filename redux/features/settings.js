import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  WORD_LENGTH: 6,
  BOARD_SIZE: 7,
  colorBlind: false,
  pushNotifications: false,
  gameType: "normal",
  hardMode: false,
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
      const { WORD_LENGTH, BOARD_SIZE, gameType } = action.payload;
      state.WORD_LENGTH = WORD_LENGTH;
      state.BOARD_SIZE = BOARD_SIZE;
      state.gameType = gameType;
    },
    setColorBlind: (state, action) => {
      state.colorBlind = action.payload;
    },
    setPushNotifications: (state, action) => {
      state.pushNotifications = action.payload;
    },
    setHardMode: (state, action) => {
      state.hardMode = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setSettings,
  setWordSize,
  setBoardSize,
  setColorBlind,
  setHardMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
