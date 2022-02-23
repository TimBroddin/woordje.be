import { RANDOM_WORD_QUERY } from "../../queries";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "graphql-request";

const initialState = {
  value: "",
};

const getRandomWord = createAsyncThunk(
  "randomWord/getRandomWord",
  async (_, thunkAPI) => {
    const { wordLength } = thunkAPI.getState().settings;

    const res = await request(`/api/graphql`, RANDOM_WORD_QUERY, {
      wordLength,
      amount: 1,
    });
    const word = res.getRandomWords?.[0];

    return word;
  }
);

export const randomWordSlice = createSlice({
  name: "randomWord",
  initialState,
  reducers: {
    setRandomWord: (state, { payload }) => {
      state.value = payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getRandomWord.fulfilled, (state, action) => {
      // Add user to the state array
      state.value = action.payload;
    });
  },
});

const { setRandomWord } = randomWordSlice.actions;
// Action creators are generated for each case reducer function
export { getRandomWord, setRandomWord };

export default randomWordSlice.reducer;
