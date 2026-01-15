import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set) => ({
      wordLength: 6,
      boardSize: 7,
      colorBlind: false,
      hardMode: false,
      gameType: "normal",
      gameId: null,

      setSettings: ({ wordLength, boardSize, gameType, gameId }) => {
        set({ wordLength, boardSize, gameType, gameId });
      },

      setColorBlind: (colorBlind) => {
        set({ colorBlind });
      },

      setHardMode: (hardMode) => {
        set({ hardMode });
      },

      setWordLength: (wordLength) => {
        set({ wordLength, boardSize: wordLength + 1 });
      },
    }),
    {
      name: "woordje-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
