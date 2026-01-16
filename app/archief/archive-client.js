"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { Main, Levels, Level, Note } from "@/components/styled";
import Header from "@/components/Header";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getTodaysGameId } from "@/lib/gameId";

const ITEMS_PER_PAGE = 20;

function GameCard({ displayGameId }) {
  const data = useStatisticsStore((state) => state.data);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold font-mono">
          #{displayGameId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Levels>
          {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
            const tries = data?.[level]?.[displayGameId];
            const won = tries !== null && tries !== undefined && tries >= 0;
            const lost = tries === -1;

            return (
              <Tooltip key={`level-${level}`}>
                <TooltipTrigger asChild>
                  <NextLink
                    href={`/archief/${displayGameId}x${level}`}
                    prefetch={false}
                  >
                    <Level active={false} won={won} lost={lost}>
                      {level}
                    </Level>
                  </NextLink>
                </TooltipTrigger>
                <TooltipContent>
                  {lost
                    ? "Je verloor dit level."
                    : won
                    ? `Je deed hier ${tries} ${
                        tries === 1 ? "poging" : "pogingen"
                      } over.`
                    : "Je speelde dit level nog niet."}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </Levels>
      </CardContent>
    </Card>
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
      <Main>
        <Header
          showStats={false}
          showInfo={false}
          showHome={true}
          emptyRight={true}
          customTitle="Archief"
        />
        <Note type="primary" className="mb-6">
          <p className="text-[var(--primary-foreground)] m-0 text-sm">
            Hier kan je alle vorige spellen opnieuw spelen. Eenmaal gespeeld
            blijft je score onthouden. Het is niet mogelijk om je score nog te
            verbeteren.
          </p>
        </Note>
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {gameIds.map((gameId) => (
            <GameCard displayGameId={gameId} key={`word-${gameId}`} />
          ))}
        </div>
        <div className="flex justify-center items-center gap-4 px-4 pb-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Vorige
          </Button>
          <span className="text-sm text-muted-foreground">
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
