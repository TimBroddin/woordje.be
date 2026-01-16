"use client";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";

import { m } from "framer-motion";
import {
  SiX,
  SiFacebook,
  SiWhatsapp,
  SiThreads,
} from "@icons-pack/react-simple-icons";
import { Linkedin, Share2 } from "lucide-react";

import NextLink from "next/link";
import { copyToClipboard, getIsVictory, calculateStreak } from "@/lib/helpers";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useGameStore } from "@/lib/stores/game-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useStatisticsStore } from "@/lib/stores/statistics-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { getTodaysGameId } from "@/lib/gameId";

import { usePlausible } from "next-plausible";

const LazyLoadMarkDown = dynamic(() => import("./Markdown"));

const SharePreview = ({ header, grid, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "p-5 bg-gradient-to-br from-[var(--muted)] to-[var(--background)] rounded-2xl",
      "border border-[var(--border)]",
      "shadow-lg",
      "select-all cursor-pointer",
      "hover:shadow-xl hover:scale-[1.01]",
      "transition-all duration-200 ease-out"
    )}
  >
    <div
      className="text-sm text-[var(--muted-foreground)] mb-4 text-center"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {header}
    </div>
    <div className="flex flex-col gap-2 items-center w-full">
      {grid.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map((cell, j) => (
            <div
              key={j}
              className={cn(
                "w-7 h-7 rounded-full shadow-sm transition-transform",
                cell === "good" && "bg-[var(--color-good)] shadow-[0_2px_8px_rgba(34,197,94,0.4)]",
                cell === "off" && "bg-[var(--color-off)] shadow-[0_2px_8px_rgba(234,179,8,0.3)]",
                cell === "bad" && "bg-black dark:bg-zinc-800"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const StreakBadge = ({ children, ...props }) => (
  <m.div
    className={cn(
      "inline-flex items-center gap-2 px-5 py-2.5",
      "bg-gradient-to-r from-[var(--primary)] via-[#a78bfa] to-[var(--accent)]",
      "text-white font-bold text-lg",
      "border-none rounded-full",
      "shadow-[var(--shadow-soft),_0_0_20px_rgba(139,92,246,0.4)]"
    )}
    {...props}
  >
    <span>🎳</span>
    <span style={{ fontFamily: "var(--font-display)" }}>{children}</span>
  </m.div>
);

const SocialButton = ({ icon: Icon, label, onClick }) => (
  <Button
    size="sm"
    variant="outline"
    className="flex-1 min-w-[120px]"
    onClick={onClick}
  >
    <Icon size={16} className="mr-2" />
    {label}
  </Button>
);

const Results = ({ visible, toast, solution: propSolution }) => {
  const translations = useTranslations();
  const { wordLength, boardSize, hardMode, gameId } = useSettingsStore();
  const { guesses, setGameState } = useGameStore();
  const { data: statistics } = useStatisticsStore();
  const { timerStart, timerValue, setModal } = useUIStore();
  const plausible = usePlausible();

  // Calculate display game ID based on locale
  const displayGameId = translations.id === "woordje" ? gameId : gameId - 36;
  const isArchive = gameId !== getTodaysGameId();

  // Calculate streak using statistics
  const streak = calculateStreak(statistics, wordLength, gameId);

  // Build game state from Zustand store
  const currentGuesses = guesses[wordLength] || [];
  const gameState = { guesses: currentGuesses };

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
            toast.success("Gekopieerd!", { id: "clipboard" });
          } else {
            toast.error("Clipboard error", { id: "clipboard" });
          }
        });
      }
    },
    [gameState, getShareText, toast]
  );

  const isVictory = getIsVictory(gameState);

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isVictory ? "🎉 " : ""}Het woord was{" "}
            <span
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent px-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {solution?.word?.toUpperCase()}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Solution meaning */}
          {solution?.meaning && (
            <div className="p-4 bg-[var(--muted)] rounded-xl border-none">
              <p className="text-sm text-[var(--foreground)]">
                <strong className="text-[var(--primary)]">Betekenis:</strong>{" "}
                <LazyLoadMarkDown text={solution.meaning} />
              </p>
            </div>
          )}

          {/* Streak badge */}
          {streak > 1 && (
            <div className="flex justify-center">
              <StreakBadge
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 720 }}
                transition={{
                  delay: 0.3,
                  rotate: { type: "spring", stiffness: 100 },
                }}
              >
                {streak} streak!
              </StreakBadge>
            </div>
          )}

          {/* Share preview */}
          <SharePreview
            header={getShareHeader()}
            grid={getShareGrid()}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Copy button */}
          <Button onClick={onCopyToClipboard} className="w-full">
            📋 Kopieer resultaat
          </Button>

          {/* Social sharing */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-center text-[var(--muted-foreground)]">
              Deel je score
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <SocialButton
                icon={SiX}
                label="X"
                onClick={() => {
                  plausible("Share", { props: { method: "x" } });
                  window.open(
                    `https://x.com/intent/tweet?text=${encodeURIComponent(
                      getShareText(false, true)
                    )}`,
                    "_blank"
                  );
                }}
              />
              <SocialButton
                icon={SiFacebook}
                label="Facebook"
                onClick={() => {
                  plausible("Share", { props: { method: "facebook" } });
                  window.open(
                    `https://www.facebook.com/share.php?u=${encodeURIComponent(
                      `${
                        translations.url
                      }/share/${gameId}/${wordLength}/${getEncodedState(gameState)}`
                    )}`,
                    "_blank"
                  );
                }}
              />
              <SocialButton
                icon={SiWhatsapp}
                label="WhatsApp"
                onClick={() => {
                  plausible("Share", { props: { method: "whatsapp" } });
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      getShareText(false, true)
                    )}`,
                    "_blank"
                  );
                }}
              />
              <SocialButton
                icon={Linkedin}
                label="LinkedIn"
                onClick={() => {
                  plausible("Share", { props: { method: "linkedin" } });
                  window.open(
                    `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                      `${
                        translations.url
                      }/share/${gameId}/${wordLength}/${getEncodedState(gameState)}`
                    )}`,
                    "_blank"
                  );
                }}
              />
              <SocialButton
                icon={SiThreads}
                label="Threads"
                onClick={() => {
                  plausible("Share", { props: { method: "threads" } });
                  const text = getShareText(false, true)
                    .replace(/🟩/g, "X")
                    .replace(/🟨/g, "o")
                    .replace(/⬛️?/g, "-")
                    .replace(/ ▪️ /g, " | ")
                    .replace(/💡 /g, "")
                    .replace(/🎳 /g, "streak: ")
                    .replace(/🕑 /g, "");
                  window.open(
                    `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
                    "_blank"
                  );
                }}
              />
              {typeof window !== "undefined" && window?.navigator?.share && (
                <SocialButton
                  icon={Share2}
                  label="Meer..."
                  onClick={() => {
                    if (window.navigator.share) {
                      plausible("Share", { props: { method: "webshare" } });
                      window.navigator
                        .share({ text: getShareText(false, true) })
                        .catch(() => {});
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Play again options */}
          <div className="pt-4">
            <p className="text-sm text-[var(--foreground)]">
              Probeer ook met{" "}
              {[3, 4, 5, 6, 7, 8, 9, 10]
                .filter((x) => x !== wordLength)
                .map((x, i, arr) => (
                  <span key={`link-${x}`}>
                    <NextLink
                      href={`/speel/${x}`}
                      onClick={() => setModal(null)}
                      className="font-bold text-[var(--primary)] hover:underline"
                    >
                      {x}
                    </NextLink>
                    {i < arr.length - 2 ? ", " : i < arr.length - 1 ? " of " : ""}
                  </span>
                ))}{" "}
              letters, of{" "}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setModal(null);
                  setGameState({ gameId, wordLength, guesses: [] });
                }}
                className="font-bold text-[var(--primary)] hover:underline"
              >
                probeer opnieuw
              </button>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Results;
