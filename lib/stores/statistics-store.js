import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Migrate old Redux persist:root statistics to new Zustand format
function migrateFromRedux() {
  if (typeof window === "undefined") return null;

  try {
    const oldData = localStorage.getItem("persist:root");
    if (!oldData) return null;

    const parsed = JSON.parse(oldData);
    if (!parsed.statistics) return null;

    // Redux-persist stores each slice as a JSON string
    const oldStats = JSON.parse(parsed.statistics);
    if (!Array.isArray(oldStats)) return null;

    // Convert sparse array format to object format
    // Old: statistics[wordLength][gameId] = tries
    // New: data[wordLength][gameId] = tries
    const migrated = {};
    let totalMigrated = 0;

    oldStats.forEach((gameResults, wordLength) => {
      if (!gameResults || !Array.isArray(gameResults)) return;

      migrated[wordLength] = {};
      gameResults.forEach((tries, gameId) => {
        if (tries !== undefined && tries !== null) {
          migrated[wordLength][gameId] = tries;
          totalMigrated++;
        }
      });

      // Remove empty word lengths
      if (Object.keys(migrated[wordLength]).length === 0) {
        delete migrated[wordLength];
      }
    });

    return Object.keys(migrated).length > 0 ? migrated : null;
  } catch (e) {
    console.error("Failed to migrate Redux statistics:", e);
    return null;
  }
}

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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate statistics store:", error);
          return;
        }

        // Attempt migration from old Redux format
        const migrated = migrateFromRedux();
        if (!migrated) return;

        // Merge migrated data with existing data (existing takes precedence)
        const current = state?.data || {};
        const merged = { ...migrated };

        // Merge existing data on top of migrated data
        Object.keys(current).forEach((wordLength) => {
          merged[wordLength] = {
            ...(migrated[wordLength] || {}),
            ...current[wordLength], // Existing data wins
          };
        });

        // Update store with merged data - use setTimeout to defer until store is initialized
        setTimeout(() => {
          useStatisticsStore.setState({ data: merged });

          // Clean up old Redux data after successful migration
          try {
            localStorage.removeItem("persist:root");
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 0);
      },
    }
  )
);
