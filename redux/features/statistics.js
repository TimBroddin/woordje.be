import { createSlice } from "@reduxjs/toolkit";

const data = {
  winDistribution: [], // array consisting of  tries per gameId, lose = -1
};

const initialState = [];

export const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    addWin: (state, { payload: { gameId, WORD_LENGTH, guesses } }) => {
      if (!state[WORD_LENGTH]) {
        state[WORD_LENGTH] = [];
      }
      // don't overwrite already played games
      if (!state[WORD_LENGTH][gameId]) {
        state[WORD_LENGTH][gameId] = guesses;
      }
    },
    addLoss: (state, { payload: { gameId, WORD_LENGTH } }) => {
      if (!state[WORD_LENGTH]) {
        state[WORD_LENGTH] = [];
      }
      // don't overwrite already played games
      if (!state[WORD_LENGTH][gameId]) {
        state[WORD_LENGTH][gameId] = -1;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { addWin, addLoss } = statisticsSlice.actions;

export default statisticsSlice.reducer;
