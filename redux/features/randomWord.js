import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "",
};

export const randomWordSlice = createSlice({
  name: "randomWord",
  initialState,
  reducers: {
    getRandomWord: async (state, action) => {
      const res = await fetch(`/api/random?l=${action.payload}}`);
      const json = await res.json();
      state.value = json;
    },
  },
});

// Action creators are generated for each case reducer function
export const { getRandomWord } = randomWordSlice.actions;

export default randomWordSlice.reducer;
