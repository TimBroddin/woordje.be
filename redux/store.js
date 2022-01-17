import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import gameState from "./features/gameState";
import settings from "./features/settings";
import randomWord from "./features/randomWord";
import statistics from "./features/statistics";

const persistConfig = {
  key: "root",
  storage,
};

const reducers = combineReducers({
  gameState,
  settings,
  randomWord,
  statistics,
});

const persistedReducer = persistReducer(persistConfig, reducers);
let store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: [thunk],
});

export default store;
