import { STATS_QUERY } from "../../queries";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "graphql-request";

const initialState = {
  value: { wins: 0, distribution: [] },
};

const getStats = createAsyncThunk("gameStats/getStats", async (_, thunkAPI) => {
  const { wordLength, gameId, gameType } = thunkAPI.getState().settings;

  const res = await request(`/api/graphql`, STATS_QUERY, {
    wordLength,
    gameId,
    gameType: "normal",
  });
  const stats = res.stats;

  return stats;
});

export const gameStatsSlice = createSlice({
  name: "gameStats",
  initialState,
  reducers: {
    setStats: (state, { payload }) => {
      state.value = payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getStats.fulfilled, (state, action) => {
      // Add user to the state array
      state.value = action.payload;
    });
  },
});

const { setStats } = gameStatsSlice.actions;
// Action creators are generated for each case reducer function
export { getStats, setStats };

export default gameStatsSlice.reducer;
