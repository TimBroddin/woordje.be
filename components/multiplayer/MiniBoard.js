"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/multiplayer/messages";

const CELL_COLOR = {
  good: "bg-[var(--color-good)]",
  off: "bg-[var(--color-off)]",
  bad: "bg-[var(--color-bad)]",
};

export function playerStatus(player, { finished, maxGuesses } = {}) {
  const n = player.guesses.length;
  if (!player.playing) return { tone: "muted", label: "kijkt mee" };
  if (player.solved) {
    return { tone: "good", label: `${n} ${n === 1 ? "poging" : "pogingen"} · ${formatDuration(player.solvedMs)}` };
  }
  if (player.forfeit) return { tone: "muted", label: "opgegeven" };
  if (player.done) return { tone: "muted", label: "niet geraden" };
  if (finished) return { tone: "muted", label: "tijd op" };
  if (!player.connected) return { tone: "muted", label: "verbinding kwijt" };
  return { tone: "default", label: `${n} / ${maxGuesses}` };
}

/**
 * Compact board for another player. While the round runs we only get colours;
 * once it's over the letters come along too (`reveal`).
 */
export default function MiniBoard({ player, wordLength, maxGuesses, reveal, highlight, finished, size = "sm" }) {
  const status = playerStatus(player, { finished, maxGuesses });
  const cell = reveal
    ? "w-5 h-5 text-[10px] rounded-[4px]"
    : size === "lg"
      ? "w-3.5 h-3.5 rounded-[3px]"
      : maxGuesses > 7
      ? "w-1.5 h-1.5 rounded-[2px]"
      : "w-2 h-2 rounded-[2px]";
  const gap = reveal ? "gap-[3px]" : "gap-[2px]";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-xl border bg-[var(--surface)]",
        "transition-[border-color,opacity] duration-300",
        highlight ? "border-[var(--color-good)]" : "border-[var(--border)]",
        !player.connected && "opacity-60"
      )}
    >
      <div className={cn("flex flex-col", gap)} aria-hidden="true">
        {Array.from({ length: maxGuesses }, (_, r) => {
          const row = player.guesses[r];
          return (
            <div key={r} className={cn("flex", gap)}>
              {Array.from({ length: wordLength }, (_, c) => {
                const l = row?.[c];
                return (
                  <div
                    key={c}
                    className={cn(
                      cell,
                      "flex items-center justify-center font-bold uppercase text-white",
                      l ? CELL_COLOR[l.score] : "bg-[var(--color-unknown)]"
                    )}
                  >
                    {reveal && l?.letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="text-center leading-tight max-w-[120px]">
        <div className="text-xs font-bold truncate">{player.name}</div>
        <div
          className={cn(
            "text-[11px] font-semibold tabular-nums",
            status.tone === "good" ? "text-[var(--color-good-text)]" : "text-[var(--muted-foreground)]"
          )}
        >
          {status.label}
        </div>
      </div>
    </div>
  );
}
