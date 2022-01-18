import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { start } from "./timer";

const initialState = {
  value: "",
};

const setInputText = createAsyncThunk(
  "inputText/setInputText",
  async (text, thunkAPI) => {
    const { getState, dispatch } = thunkAPI;
    const { gameState, settings, inputText, timer } = getState();

    if (
      gameState &&
      settings &&
      !gameState.guesses[settings.WORD_LENGTH]?.length &&
      inputText?.value?.length === 0 &&
      !timer.start
    ) {
      dispatch(start());
    }
    return text;
  }
);

export const inputTextSlice = createSlice({
  name: "inputText",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(setInputText.fulfilled, (state, action) => {
      // Add user to the state array
      state.value = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
export { setInputText };

export default inputTextSlice.reducer;
