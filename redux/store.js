import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import gameState from "./features/gameState";
import settings from "./features/settings";
import randomWord from "./features/randomWord";
import statistics from "./features/statistics";
import timer from "./features/timer";
import inputText from "./features/inputText";
import installPopup from "./features/installPopup";
import modal from "./features/modal";

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["randomWord", "timer"],
};

const reducers = combineReducers({
  gameState,
  settings,
  randomWord,
  statistics,
  timer,
  inputText,
  modal,
  installPopup,
});

const persistedReducer = persistReducer(persistConfig, reducers);
let store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: [thunk],
});

export default store;
