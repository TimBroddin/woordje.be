"use client";

import { useEffect, useState } from "react";
import { MULTIPLAYER_URL } from "./config";
import { getPresenceId } from "./identity";

const POLL_MS = 10_000;

/**
 * Players online and open rooms, refreshed every 10 s while the tab is
 * visible. Polling also counts this visitor as "online" for 30 s.
 * Returns null until the first answer arrives.
 */
export function useLobby() {
  const [lobby, setLobby] = useState(null);

  useEffect(() => {
    let stopped = false;
    let timer = null;

    const schedule = () => {
      clearTimeout(timer);
      if (!stopped) timer = setTimeout(load, POLL_MS);
    };

    async function load() {
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch(`${MULTIPLAYER_URL}/lobby?v=${getPresenceId()}`);
          if (res.ok) {
            const data = await res.json();
            if (!stopped) setLobby({ ...data, clockOffset: data.now - Date.now() });
          }
        } catch {
          // offline or server down: keep showing the last snapshot
        }
      }
      schedule();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };

    load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return lobby;
}
