"use client";

import { useCallback } from "react";

/**
 * Send a custom event to Rybbit.
 * Safe to call before the tracking script has loaded (no-op in that case).
 */
export function trackEvent(name, props = {}) {
  if (typeof window === "undefined") return;
  window.rybbit?.event(name, props);
}

/**
 * Hook returning a stable event tracker, mirroring the old usePlausible() API.
 */
export function useAnalytics() {
  return useCallback((name, props) => trackEvent(name, props), []);
}
