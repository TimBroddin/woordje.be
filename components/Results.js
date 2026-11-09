"use client";

import { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";

import {
  SiX,
  SiFacebook,
  SiWhatsapp,
  SiThreads,
} from "@icons-pack/react-simple-icons";
import { ChevronRight, Copy, Share2, Users } from "lucide-react";

// LinkedIn's logo isn't in lucide-react (≥1.0 dropped brand icons) or Simple Icons,
// so it's drawn here. Same props as the other share icons.
const LinkedinIcon = ({ size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 4.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

import NextLink from "next/link";
import { Levels, Level } from "@/components/styled";
import { copyToClipboard, getIsVictory, calculateStreak } from "@/lib/helpers";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useGameStore } from "@/lib/stores/game-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getTodaysGameId } from "@/lib/gameId";

import { useAnalytics } from "@/lib/analytics";
import BetaBadge from "@/components/BetaBadge";

const Definition = dynamic(() => import("./Definition"), { ssr: false });

const SharePreview = ({ header, grid }) => (
  <div className="rounded-xl bg-[var(--muted)] p-4 select-all">
    <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-3 text-center">{header}</div>
    <div className="flex flex-col gap-1 items-center" aria-hidden="true">
      {grid.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((cell, j) => (
            <div
              key={j}
              className={cn(
                "w-5 h-5 rounded-[4px]",
                cell === "good" && "bg-[var(--color-good)]",
                cell === "off" && "bg-[var(--color-off)]",
                cell === "bad" && "bg-[var(--color-bad)]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const SocialButton = ({ icon: Icon, label, onClick }) => (
  <Button size="icon" variant="ghost" aria-label={`Deel via ${label}`} title={label} onClick={onClick}>
    <Icon size={18} />
  </Button>
);

const Results = ({ visible, toast, solution: propSolution }) => {
  const translations = useTranslations();
  const { wordLength, boardSize, hardMode, gameId } = useSettingsStore();
  const { guesses, setGameState } = useGameStore();
  const { data: statistics } = useStatisticsStore();
  const { timerStart, timerValue, setModal } = useUIStore();
  const track = useAnalytics();

  // Calculate display game ID based on locale
  const displayGameId = translations.id === "woordje" ? gameId : gameId - 36;
  const isArchive = gameId !== getTodaysGameId();

  // Calculate streak using statistics
  const streak = calculateStreak(statistics, wordLength, gameId);

  // Build game state from Zustand store
  const currentGuesses = useMemo(() => guesses[wordLength] || [], [guesses, wordLength]);
  const gameState = useMemo(() => ({ guesses: currentGuesses }), [currentGuesses]);

  // Use prop solution if provided
  const solution = propSolution;

  const closeHandler = () => {
    setModal(null);
  };

  const getShareText = useCallback(
    (html = false, addHashtag = false) => {
      const header = [
        `${
          html ? translations.share_html : translations.share_text
        } #${displayGameId} x ${wordLength}`,
      ];
      if (isArchive) {
        header.push("archief");
      }

      if (hardMode) {
        header.push(`💀 Extra moeilijk`);
      }
      header.push(
        `💡 ${
          getIsVictory(gameState) ? gameState.guesses.length : "X"
        }/${boardSize}`
      );
      if (streak > 1) {
        header.push(`🎳 ${streak}`);
      }

      if (timerStart && timerValue && getIsVictory(gameState)) {
        header.push(
          `🕑 ${
            timerValue / 1000 > 3
              ? Math.round(timerValue / 1000)
              : (timerValue / 1000).toFixed(2)
          }s`
        );
      }

      const text = `${header.join(" ▪️ ")}

${gameState.guesses
  .map((line) => {
    return line
      .map((item) => {
        return item.score === "good"
          ? "🟩"
          : item.score === "off"
          ? "🟨"
          : "⬛️";
      })
      .join("");
  })
  .join("\n")}`;
      if (html) {
        return text.replace(/\n/g, "<br>");
      } else {
        return `${text}${addHashtag ? "\n" + translations.share_hashtag : ""}`;
      }
    },
    [
      translations.share_html,
      translations.share_text,
      translations.share_hashtag,
      displayGameId,
      gameState,
      boardSize,
      streak,
      timerStart,
      timerValue,
      wordLength,
      hardMode,
      isArchive,
    ]
  );

  const getEncodedState = useCallback(() => {
    return gameState.guesses
      .map((line) =>
        line
          .map((item) =>
            item.score === "good" ? "🟩" : item.score === "off" ? "🟨" : "⬛️"
          )
          .join("")
      )
      .join("");
  }, [gameState]);

  const getShareHeader = useCallback(() => {
    const parts = [
      `${translations.share_text} #${displayGameId} x ${wordLength}`,
    ];
    if (isArchive) parts.push("archief");
    if (hardMode) parts.push("💀 Extra moeilijk");
    parts.push(
      `💡 ${getIsVictory(gameState) ? gameState.guesses.length : "X"}/${boardSize}`
    );
    if (streak > 1) parts.push(`🎳 ${streak}`);
    if (timerStart && timerValue && getIsVictory(gameState)) {
      parts.push(
        `🕑 ${timerValue / 1000 > 3 ? Math.round(timerValue / 1000) : (timerValue / 1000).toFixed(2)}s`
      );
    }
    return parts.join(" ▪️ ");
  }, [
    translations.share_text,
    displayGameId,
    wordLength,
    isArchive,
    hardMode,
    gameState,
    boardSize,
    streak,
    timerStart,
    timerValue,
  ]);

  const getShareGrid = useCallback(() => {
    return gameState.guesses.map((line) =>
      line.map((item) => item.score)
    );
  }, [gameState]);

  const onCopyToClipboard = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (gameState) {
        copyToClipboard({
          "text/plain": getShareText(),
          "text/html": getShareText(true),
        }).then((ok) => {
          if (ok) {
            toast.success("Resultaat gekopieerd", { id: "clipboard" });
          } else {
            toast.error("Kopiëren lukte niet", { id: "clipboard" });
          }
        });
      }
    },
    [gameState, getShareText, toast]
  );

  const isVictory = getIsVictory(gameState);

  const tries = currentGuesses.length;
  const canNativeShare = typeof window !== "undefined" && !!window.navigator?.share;

  const share = (method, url) => {
    track("Share", { method });
    window.open(url, "_blank");
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isVictory ? `Geraden in ${tries} ${tries === 1 ? "poging" : "pogingen"}` : "Niet geraden"}
          </DialogTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Het woord was{" "}
            <strong className="font-display text-base font-semibold uppercase tracking-wide text-[var(--foreground)]">
              {solution?.word}
            </strong>
            {streak > 1 && <> · {streak} dagen op rij</>}
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {visible && <Definition word={solution?.word} />}

          <div className="space-y-3">
            <SharePreview header={getShareHeader()} grid={getShareGrid()} />
            <div className="flex gap-2">
              {canNativeShare ? (
                <>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      track("Share", { method: "webshare" });
                      window.navigator.share({ text: getShareText(false, true) }).catch(() => {});
                    }}
                  >
                    <Share2 /> Deel resultaat
                  </Button>
                  <Button variant="outline" onClick={onCopyToClipboard}>
                    <Copy /> Kopieer
                  </Button>
                </>
              ) : (
                <Button className="flex-1" onClick={onCopyToClipboard}>
                  <Copy /> Kopieer resultaat
                </Button>
              )}
            </div>
            <div className="flex justify-center gap-1">
              <SocialButton
                icon={SiWhatsapp}
                label="WhatsApp"
                onClick={() =>
                  share("whatsapp", `https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText(false, true))}`)
                }
              />
              <SocialButton
                icon={SiX}
                label="X"
                onClick={() =>
                  share("x", `https://x.com/intent/tweet?text=${encodeURIComponent(getShareText(false, true))}`)
                }
              />
              <SocialButton
                icon={SiThreads}
                label="Threads"
                onClick={() => {
                  const text = getShareText(false, true)
                    .replace(/🟩/g, "X")
                    .replace(/🟨/g, "o")
                    .replace(/⬛️?/g, "-")
                    .replace(/ ▪️ /g, " | ")
                    .replace(/💡 /g, "")
                    .replace(/🎳 /g, "streak: ")
                    .replace(/🕑 /g, "");
                  share("threads", `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`);
                }}
              />
              <SocialButton
                icon={SiFacebook}
                label="Facebook"
                onClick={() =>
                  share(
                    "facebook",
                    `https://www.facebook.com/share.php?u=${encodeURIComponent(
                      `${translations.url}/share/${gameId}/${wordLength}/${getEncodedState(gameState)}`
                    )}`
                  )
                }
              />
              <SocialButton
                icon={LinkedinIcon}
                label="LinkedIn"
                onClick={() =>
                  share(
                    "linkedin",
                    `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                      `${translations.url}/share/${gameId}/${wordLength}/${getEncodedState(gameState)}`
                    )}`
                  )
                }
              />
            </div>
          </div>

          <NextLink
            href="/multiplayer"
            onClick={() => {
              track("Multiplayer", { action: "results" });
              setModal(null);
            }}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 no-underline text-inherit hover:bg-[var(--muted)] transition-colors duration-150"
          >
            <span className="h-10 w-10 shrink-0 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] inline-flex items-center justify-center">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-bold">
                Daag je vrienden uit <BetaBadge />
              </span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                Multiplayer: iedereen raadt tegelijk hetzelfde woord.
              </span>
            </span>
            <ChevronRight className="size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
          </NextLink>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Nog een woord van vandaag
            </p>
            <Levels>
              {[3, 4, 5, 6, 7, 8, 9, 10]
                .filter((x) => x !== wordLength)
                .map((x) => (
                  <Level key={`link-${x}`} href={`/speel/${x}`} onClick={() => setModal(null)} className="flex-1">
                    {x}
                  </Level>
                ))}
            </Levels>
            <button
              onClick={(e) => {
                e.preventDefault();
                setModal(null);
                setGameState({ gameId, wordLength, guesses: [] });
              }}
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              Dit woord opnieuw spelen
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Results;
