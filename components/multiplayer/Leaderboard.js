"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { fetchLeaderboard } from "@/lib/multiplayer/api";

const PERIODS = [
  ["week", "Deze week"],
  ["all", "Altijd"],
];

function ScoreRow({ row }) {
  return (
    <li className={cn("flex items-center gap-3 px-4 py-2.5 text-sm", row.you && "bg-[var(--primary-soft)]")}>
      <span className="w-6 shrink-0 text-right font-bold tabular-nums text-[var(--muted-foreground)]">
        {row.rank === 1 && row.points > 0 ? (
          <Trophy className="ml-auto size-4 text-[var(--color-off)]" aria-label="1" />
        ) : (
          row.rank
        )}
      </span>
      <span className="min-w-0 flex-1 flex items-center gap-1.5">
        <span className="font-bold truncate">{row.name}</span>
        {row.you && (
          <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--surface)] text-[var(--primary)]">
            jij
          </span>
        )}
      </span>
      <span className="text-xs text-[var(--muted-foreground)] tabular-nums whitespace-nowrap">
        {row.wins} gewonnen · {row.played} gespeeld
      </span>
      <span className="w-12 shrink-0 text-right font-display font-semibold tabular-nums">
        {row.points}
        <span className="ml-0.5 font-sans text-[11px] font-semibold text-[var(--muted-foreground)]">pt</span>
      </span>
    </li>
  );
}

/** High scores: one point for every opponent you beat in a round. */
export default function Leaderboard({ className }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    fetchLeaderboard()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const board = data?.[period];

  return (
    <section
      id="hoogste-scores"
      className={cn("space-y-2 scroll-mt-4", className)}
      aria-labelledby="highscores-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="highscores-title"
          className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]"
        >
          Hoogste scores
        </h2>
        <div
          role="tablist"
          aria-label="Periode"
          className="inline-flex rounded-lg bg-[var(--muted)] p-0.5 text-xs font-bold"
        >
          {PERIODS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={period === key}
              onClick={() => {
                setPeriod(key);
                trackEvent("Multiplayer Leaderboard", { period: key });
              }}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors duration-150",
                period === key
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-soft-sm)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">
        Je krijgt een punt voor elke speler die je in een ronde verslaat.
      </p>

      {!data ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          {failed ? "De scores zijn nu niet beschikbaar." : "Scores laden…"}
        </p>
      ) : board.rows.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Nog geen scores{period === "week" ? " deze week" : ""}. Speel een ronde en sta meteen bovenaan!
        </p>
      ) : (
        <ol className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
          {board.rows.map((row) => (
            <ScoreRow key={`${row.rank}-${row.name}`} row={row} />
          ))}
          {board.you && (
            <>
              <li aria-hidden="true" className="py-0.5 text-center text-xs text-[var(--muted-foreground)]">
                ⋯
              </li>
              <ScoreRow row={board.you} />
            </>
          )}
        </ol>
      )}
    </section>
  );
}
