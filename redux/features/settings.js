import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  wordLength: 6,
  boardSize: 7,
  colorBlind: false,
  pushNotifications: false,
  gameType: "normal",
  hardMode: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setGameId: (state, action) => {
      state.gameId = action.value;
    },
    setWordSize: (state, action) => {
      state.wordLength = action.value;
    },
    setBoardSize: (state, action) => {
      state.boardSize = action.value;
    },
    setSettings: (state, action) => {
      const { wordLength, boardSize, gameType, gameId } = action.payload;
      state.wordLength = wordLength;
      state.boardSize = boardSize;
      state.gameType = gameType;
      state.gameId = gameId;
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
  setGameId,
  setSettings,
  setWordSize,
  setBoardSize,
  setColorBlind,
  setHardMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
