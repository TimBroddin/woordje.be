"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Provider to handle Zustand store hydration.
 * Renders nothing on the server and during hydration (the persisted stores
 * only exist in the browser), then the real content.
 */
export function StoreProvider({ children }) {
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true, // browser, after hydration
    () => false // server render and the hydration pass
  );

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
