import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useStatisticsStore = create(
  persist(
    (set, get) => ({
      // data[wordLength][gameId] = tries (or -1 for loss)
      data: {},

      addWin: ({ gameId, wordLength, guesses }) => {
        const current = get().data;
        // Don't overwrite already played games
        if (current[wordLength]?.[gameId] !== undefined) {
          return;
        }
        set({
          data: {
            ...current,
            [wordLength]: {
              ...current[wordLength],
              [gameId]: guesses,
            },
          },
        });
      },

      addLoss: ({ gameId, wordLength }) => {
        const current = get().data;
        // Don't overwrite already played games
        if (current[wordLength]?.[gameId] !== undefined) {
          return;
        }
        set({
          data: {
            ...current,
            [wordLength]: {
              ...current[wordLength],
              [gameId]: -1,
            },
          },
        });
      },

      getResult: (wordLength, gameId) => {
        return get().data[wordLength]?.[gameId];
      },

      // Get all results for a specific word length
      getResultsForWordLength: (wordLength) => {
        return get().data[wordLength] || {};
      },
    }),
    {
      name: "woordje-statistics",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
