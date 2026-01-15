import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Modal
      currentModal: "splash",
      setModal: (modal) => set({ currentModal: modal }),
      hideModal: () => set({ currentModal: false }),

      // Input text
      inputText: "",
      setInputText: (inputText) => {
        const state = get();
        // Start timer on first character if not already started
        if (state.inputText.length === 0 && inputText.length > 0 && !state.timerStart) {
          set({ inputText, timerStart: Date.now(), timerValue: 0 });
        } else {
          set({ inputText });
        }
      },

      // Timer (not persisted)
      timerStart: 0,
      timerValue: 0,
      startTimer: () => set({ timerStart: Date.now(), timerValue: 0 }),
      stopTimer: () => {
        const start = get().timerStart;
        if (start) {
          set({ timerValue: Date.now() - start });
        }
      },
      resetTimer: () => set({ timerStart: 0, timerValue: 0 }),

      // Install popup
      installPopupVisible: true,
      setInstallPopupVisible: (visible) => set({ installPopupVisible: visible }),
      hideInstallPopup: () => set({ installPopupVisible: false }),
      showInstallPopup: () => set({ installPopupVisible: true }),

      // Random word (from SSR, not persisted)
      randomWord: "",
      setRandomWord: (randomWord) => set({ randomWord }),

      // Game stats from server (not persisted)
      gameStats: { wins: 0, distribution: [] },
      setGameStats: (gameStats) => set({ gameStats }),
    }),
    {
      name: "woordje-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        currentModal: state.currentModal,
        installPopupVisible: state.installPopupVisible,
        inputText: state.inputText,
      }),
    }
  )
);
