"use client";

import { useEffect, useState } from "react";

/**
 * Provider to handle Zustand store hydration
 * Prevents hydration mismatch by waiting for client-side hydration
 */
export function StoreProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show nothing until hydrated to prevent hydration mismatch
  // The actual content will flash in, which is acceptable for a game app
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
