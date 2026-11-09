"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MULTIPLAYER_WS_URL } from "./config";
import { getName, getPresenceId, getToken } from "./identity";

const PING_MS = 25_000;
const MAX_BACKOFF_MS = 5_000;

/**
 * Live connection to one room. Reconnects with backoff (and immediately when
 * the tab becomes visible / the network comes back), so phones going to sleep
 * mid-round just pick up where they left off.
 *
 * status: "connecting" | "open" | "reconnecting" | "fatal"
 *
 * One hook instance = one room: render the component with key={code} so
 * switching rooms starts from a clean slate.
 */
export function useRoom(code) {
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [fatalError, setFatalError] = useState(null);
  const [notice, setNotice] = useState(null); // non-fatal errors for fire-and-forget messages
  const wsRef = useRef(null);
  const pending = useRef(new Map()); // ref → {resolve}
  const clockOffset = useRef(0);
  const nextRef = useRef(1);

  useEffect(() => {
    let stopped = false;
    let attempt = 0;
    let retryTimer = null;
    let pingTimer = null;

    const settleAll = (result) => {
      for (const { resolve } of pending.current.values()) resolve(result);
      pending.current.clear();
    };

    const connect = () => {
      clearTimeout(retryTimer);
      // p = anonymous presence id, so the "x online" count doesn't count you twice
      const params = new URLSearchParams({ token: getToken(), name: getName(), p: getPresenceId() });
      const ws = new WebSocket(`${MULTIPLAYER_WS_URL}/rooms/${code}/ws?${params}`);
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setStatus("open");
        clearInterval(pingTimer);
        pingTimer = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send("ping"), PING_MS);
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        if (msg.type === "state") {
          clockOffset.current = msg.now - Date.now();
          setState(msg);
        } else if (msg.type === "error" && msg.fatal) {
          stopped = true;
          setFatalError(msg.code);
          setStatus("fatal");
        }

        if ((msg.type === "guessed" || msg.type === "error") && pending.current.has(msg.ref)) {
          pending.current.get(msg.ref).resolve(msg.type === "error" ? { error: msg.code } : {});
          pending.current.delete(msg.ref);
        } else if (msg.type === "error" && !msg.fatal) {
          setNotice({ code: msg.code, at: Date.now() });
        }
      };

      ws.onclose = () => {
        clearInterval(pingTimer);
        if (wsRef.current !== ws) return; // replaced by a newer socket
        settleAll({ error: "disconnected" });
        if (stopped) return;
        setStatus("reconnecting");
        const delay = Math.min(MAX_BACKOFF_MS, 400 * 2 ** attempt++);
        retryTimer = setTimeout(connect, delay);
      };
    };

    const wake = () => {
      if (stopped || document.visibilityState !== "visible") return;
      const ws = wsRef.current;
      if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        attempt = 0;
        connect();
      }
    };

    connect();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      settleAll({ error: "disconnected" });
      const ws = wsRef.current;
      wsRef.current = null;
      ws?.close(1000, "bye");
    };
  }, [code]);

  /** Fire and forget. Returns false when not connected. */
  const send = useCallback((msg) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(msg));
    return true;
  }, []);

  /** Send a guess and wait for the server's ack or error. Resolves to {} or {error}. */
  const request = useCallback(
    (msg) =>
      new Promise((resolve) => {
        const ref = nextRef.current++;
        if (!send({ ...msg, ref })) return resolve({ error: "disconnected" });
        pending.current.set(ref, { resolve });
      }),
    [send],
  );

  const serverNow = useCallback(() => Date.now() + clockOffset.current, []);

  return { state, status, fatalError, notice, send, request, serverNow };
}

/** Re-render every `ms` while `active`, for countdowns. */
export function useTicker(active, ms = 250) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [active, ms]);
}

/** The current time, refreshed every `ms` while `active` (for countdowns shown during render). */
export function useNow(active, ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}
