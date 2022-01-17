import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "",
};

const getRandomWord = createAsyncThunk(
  "randomWord/getRandomWord",
  async (_, thunkAPI) => {
    const { WORD_LENGTH } = thunkAPI.getState().settings;

    const res = await fetch(`/api/random?l=${WORD_LENGTH}`);
    const json = await res.json();
    return json;
  }
);

export const randomWordSlice = createSlice({
  name: "randomWord",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getRandomWord.fulfilled, (state, action) => {
      // Add user to the state array
      state.value = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
export { getRandomWord };

export default randomWordSlice.reducer;