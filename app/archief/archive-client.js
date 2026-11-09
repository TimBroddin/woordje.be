"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { Main } from "@/components/styled";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getTodaysGameId } from "@/lib/gameId";

const ITEMS_PER_PAGE = 20;

function GameRow({ displayGameId }) {
  const data = useStatisticsStore((state) => state.data);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] lg:odd:border-r">
      <div className="w-14 shrink-0 font-display font-semibold tabular-nums">#{displayGameId}</div>
      <div className="flex-1 grid grid-cols-8 gap-1">
        {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
          const tries = data?.[level]?.[displayGameId];
          const won = tries !== null && tries !== undefined && tries >= 0;
          const lost = tries === -1;
          const label = lost
            ? `${level} letters: niet geraden`
            : won
              ? `${level} letters: geraden in ${tries} ${tries === 1 ? "poging" : "pogingen"}`
              : `${level} letters: nog niet gespeeld`;

          return (
            <Tooltip key={`level-${level}`}>
              <TooltipTrigger asChild>
                <NextLink
                  href={`/archief/${displayGameId}x${level}`}
                  prefetch={false}
                  aria-label={`Woordje #${displayGameId}, ${label}`}
                  className={cn(
                    "h-9 rounded-md border inline-flex items-center justify-center",
                    "text-xs font-bold tabular-nums no-underline transition-colors duration-150",
                    won
                      ? "bg-[var(--color-good)] border-transparent text-white"
                      : lost
                        ? "border-[var(--color-lost)] text-[var(--color-lost)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                  )}
                >
                  {level}
                </NextLink>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export default function ArchiveClient() {
  // Auto-detect locale from hostname
  const translations = useTranslations();
  const [page, setPage] = useState(1);

  const todaysGameId = getTodaysGameId();
  const currentDisplayGameId = translations.id === "woordje" ? todaysGameId : todaysGameId - 36;

  const totalGames = currentDisplayGameId - 1;
  const totalPages = Math.ceil(totalGames / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalGames);

  const gameIds = Array.from(
    { length: endIndex - startIndex },
    (_, i) => totalGames - startIndex - i
  );

  return (
    <TooltipProvider>
      <Main wide className="lg:max-w-[920px]">
        <Header showStats={false} showInfo={false} showHome customTitle="Archief" />
        <p className="px-4 pb-4 text-sm text-[var(--muted-foreground)] max-w-[60ch]">
          Speel de woorden van vorige dagen. Kies een dag en het aantal letters. Je eerste poging telt:
          een gespeeld woord kan je niet meer verbeteren.
        </p>
        <div className="mx-4 mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {/* -mb-px hides the last row's bottom border under the panel border */}
          <div className="grid lg:grid-cols-2 -mb-px">
            {gameIds.map((gameId) => (
              <GameRow displayGameId={gameId} key={`word-${gameId}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 px-4 pb-6 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-[var(--color-good)]" /> geraden
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-[var(--color-lost)]" /> niet geraden
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-[var(--border-strong)]" /> nog niet gespeeld
          </span>
        </div>
        <div className="flex justify-center items-center gap-4 px-4 pb-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Vorige
          </Button>
          <span className="text-sm text-[var(--muted-foreground)] tabular-nums">
            Pagina {page} van {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Volgende
          </Button>
        </div>
      </Main>
    </TooltipProvider>
  );
}
