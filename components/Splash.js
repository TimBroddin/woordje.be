"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

import { useTranslations } from "@/lib/i18n/use-translations";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useUIStore } from "@/lib/stores/ui-store";
import Letter from "@/components/Letter";

const Board = ({ children, className, ...props }) => (
  <m.div className={cn("flex justify-center", className)} {...props}>
    {children}
  </m.div>
);

const Examples = ({ words }) => {
  const { wordLength } = useSettingsStore();

  const board = {
    show: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delay: 1,
      },
    },
    hidden: {
      opacity: 1,
      transition: {
        when: "afterChildren",
      },
    },
  };

  if (words && words.length) {
    return (
      <div style={{ "--word-length": wordLength }} className="space-y-4">
        <div className="p-4 bg-[var(--muted)] rounded-sm border-2 border-[var(--border)]">
          <Board initial="hidden" animate="show" variants={board}>
            {words[0].split("").map((letter, index) => (
              <Letter key={index} small score={index === 0 ? "good" : "bad"}>
                {letter}
              </Letter>
            ))}
          </Board>
          <p className="text-[var(--foreground)] mt-3 text-sm text-center">
            <span className="inline-block px-2 py-0.5 bg-[var(--color-good)] text-white font-mono font-bold rounded-sm mr-1">
              {words[0].split("")[0].toUpperCase()}
            </span>{" "}
            staat op de <strong>juiste</strong> plaats
          </p>
        </div>

        <div className="p-4 bg-[var(--muted)] rounded-sm border-2 border-[var(--border)]">
          <Board initial="hidden" animate="show" variants={board}>
            {words[1].split("").map((letter, index) => (
              <Letter key={index} small score={index === 2 ? "off" : "bad"}>
                {letter}
              </Letter>
            ))}
          </Board>
          <p className="text-[var(--foreground)] mt-3 text-sm text-center">
            <span className="inline-block px-2 py-0.5 bg-[var(--color-off)] text-white font-mono font-bold rounded-sm mr-1">
              {words[1].split("")[2].toUpperCase()}
            </span>{" "}
            zit in het woord, maar op de <strong>verkeerde</strong> plaats
          </p>
        </div>

        <div className="p-4 bg-[var(--muted)] rounded-sm border-2 border-[var(--border)]">
          <Board initial="hidden" animate="show" variants={board}>
            {words[2].split("").map((letter, index) => (
              <Letter key={index} score="bad" small>
                {letter}
              </Letter>
            ))}
          </Board>
          <p className="text-[var(--foreground)] mt-3 text-sm text-center">
            <span className="inline-block px-2 py-0.5 bg-[var(--color-bad)] text-white font-mono font-bold rounded-sm mr-1">
              ✗
            </span>{" "}
            Geen enkele letter zit in het woord
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }
};

const Splash = ({ visible, demoWords }) => {
  const translations = useTranslations();
  const { wordLength, boardSize } = useSettingsStore();
  const { setModal } = useUIStore();

  const closeHandler = () => {
    setModal(null);
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && closeHandler()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Welkom bij <strong>{translations.title}</strong>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-sm border-2 border-[var(--border-strong)]">
            <p className="text-sm font-medium text-center">
              Raad het <strong className="font-mono">{wordLength}</strong>-letterwoord in <strong className="font-mono">{boardSize}</strong> pogingen
            </p>
          </div>

          <p className="text-[var(--foreground)] text-sm">
            Elke gok moet een geldig Nederlands woord zijn. Druk op <kbd className="px-1.5 py-0.5 bg-[var(--muted)] border border-[var(--border)] rounded-sm font-mono text-xs">ENTER</kbd> om je woord in te dienen.
          </p>

          <h2 className="text-lg font-bold text-[var(--foreground)] pt-2">Voorbeelden</h2>
          <Examples words={demoWords} />

          <Button onClick={closeHandler} className="w-full" size="lg">
            Start het spel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Splash;
