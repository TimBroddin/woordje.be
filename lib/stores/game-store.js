import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useGameStore = create(
  persist(
    (set, get) => ({
      gameId: null,
      guesses: {},

      setGameState: ({ gameId, wordLength, guesses }) => {
        set((state) => ({
          gameId,
          guesses: {
            ...state.guesses,
            [wordLength]: guesses,
          },
        }));
      },

      resetGameState: (gameId) => {
        set({ gameId, guesses: {} });
      },

      getGuesses: (wordLength) => {
        return get().guesses[wordLength] || [];
      },
    }),
    {
      name: "woordje-game-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
