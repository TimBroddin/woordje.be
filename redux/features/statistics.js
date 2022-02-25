import { createSlice } from "@reduxjs/toolkit";
import { customGameResolver } from "@/lib/customGames";

const data = {
  winDistribution: [], // array consisting of  tries per gameId, lose = -1
};

const initialState = [];

export const statisticsSlice = createSlice({
  name: "statistics",
  initialState,
  reducers: {
    addWin: (state, { payload: { gameId, wordLength, gameType, guesses } }) => {
      const idx = customGameResolver(gameType, wordLength);

      if (!state[idx]) {
        state[idx] = [];
      }
      // don't overwrite already played games
      if (!state[idx][gameId]) {
        state[idx][gameId] = guesses;
      }
    },
    addLoss: (state, { payload: { gameId, gameType, wordLength } }) => {
      const idx = customGameResolver(gameType, wordLength);

      if (!state[idx]) {
        state[idx] = [];
      }
      // don't overwrite already played games
      if (!state[idx][gameId]) {
        state[idx][gameId] = -1;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { addWin, addLoss } = statisticsSlice.actions;

export default statisticsSlice.reducer;
