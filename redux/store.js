import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";

import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import gameState from "@/redux/features/gameState";
import settings from "@/redux/features/settings";
import randomWord from "@/redux/features/randomWord";
import statistics from "@/redux/features/statistics";
import timer from "@/redux/features/timer";
import inputText from "@/redux/features/inputText";
import installPopup from "@/redux/features/installPopup";
import modal from "@/redux/features/modal";

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
