"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useGameStore } from "@/lib/stores/game-store";
import { useSettingsStore } from "@/lib/stores/settings-store";

const Wrapper = ({ children, className }) => {
  return (
    <div
      className={cn(
        "mt-4 px-1 w-full max-w-[500px] mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

const KeyboardRow = ({ children, className }) => {
  return (
    <div className={cn("flex justify-center gap-[6px] mb-[6px]", className)}>
      {children}
    </div>
  );
};

const KeyLetter = ({ children, isBigger, score, onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Base layout
        "p-0 grow basis-0 max-w-[10%]",
        // Touch handling
        "[touch-action:manipulation]",
        "[-webkit-touch-callout:none]",
        "[-webkit-tap-highlight-color:transparent]",
        "select-none cursor-pointer",
        // Bigger keys (backspace, enter)
        isBigger && "max-w-[15%]",
        className
      )}
    >
      <span
        className={cn(
          // Soft, friendly key styling
          "keyboard-key",
          "block text-sm font-semibold",
          "h-[54px] flex justify-center items-center",
          "rounded-xl",
          // Score variants
          score === "good" && "good",
          score === "bad" && "bad",
          score === "off" && "off"
        )}
      >
        {children}
      </span>
    </button>
  );
};

const Keyboard = ({ onPress, onBackspace, onSubmit }) => {
  const { guesses } = useGameStore();
  const { wordLength } = useSettingsStore();
  const translations = useTranslations();

  const letterRows = translations.keyboard.map((row) => row.split(""));
  const currentGuesses = guesses[wordLength] || [];

  const used = {};
  if (currentGuesses && currentGuesses.length) {
    currentGuesses.forEach((row) => {
      row.forEach((r) => {
        used[r.letter] =
          used[r.letter] === "good"
            ? "good"
            : r.score === "bad" && !used[r.letter]
            ? "bad"
            : r.score !== "bad"
            ? r.score
            : used[r.letter];
      });
    });
  }

  useEffect(() => {
    const handler = (e) => {
      e.stopPropagation();
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      e.preventDefault();

      if (e.key === "Backspace") {
        onBackspace();
      } else if (e.key === "Enter") {
        onSubmit();
      } else if (e.key.length === 1) {
        const key = e.key.toLowerCase();
        if (key.match(/[a-z]/g)) {
          onPress(key);
        }
      }
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [onBackspace, onPress, onSubmit]);

  return (
    <Wrapper>
      {letterRows.map((row, rowIdx) => (
        <KeyboardRow key={`keyboard.${rowIdx}`}>
          {row.map((l) => {
            return (
              <KeyLetter
                key={`keyboard.${rowIdx}.${l}`}
                onClick={(e) => {
                  e.preventDefault();
                  onPress(l);
                  return false;
                }}
                score={used[l]}
              >
                {l.toUpperCase()}
              </KeyLetter>
            );
          })}
          {rowIdx === 1 && (
            <KeyLetter
              onClick={(e) => {
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                onBackspace();
                return false;
              }}
              isBigger={true}
            >
              ⌫
            </KeyLetter>
          )}
          {rowIdx === 2 && (
            <KeyLetter
              onClick={(e) => {
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                onSubmit();
                return false;
              }}
              isBigger={true}
            >
              ↵
            </KeyLetter>
          )}
        </KeyboardRow>
      ))}
    </Wrapper>
  );
};

export default Keyboard;
