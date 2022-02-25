import { createSlice } from "@reduxjs/toolkit";
import { customGameResolver } from "@/lib/customGames";

const initialState = {
  gameId: null,
  guesses: [],
};

export const gameStateSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    setGameState: (
      state,
      { payload: { gameId, wordLength, gameType, guesses } }
    ) => {
      state.gameId = gameId;
      state.guesses[customGameResolver(gameType, wordLength)] = guesses;
    },
    resetGameState: (state, action) => {
      state.gameId = action.payload;
      state.guesses = [];
    },
    fakeGameId: (state, action) => {
      state.gameId = 100;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setGameState, resetGameState } = gameStateSlice.actions;

export default gameStateSlice.reducer;
