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
    const rows = [
      { word: words[0], score: (i) => (i === 0 ? "good" : "bad"), at: 0, text: "staat op de juiste plaats." },
      { word: words[1], score: (i) => (i === 2 ? "off" : "bad"), at: 2, text: "zit in het woord, maar op een andere plaats." },
      { word: words[2], score: () => "bad", at: null, text: "Grijs: deze letters zitten niet in het woord." },
    ];
    return (
      <div style={{ "--word-length": wordLength, "--shrink-size": "6px" }} className="space-y-5">
        {rows.map(({ word, score, at, text }) => (
          <div key={word} className="space-y-2">
            <Board initial="hidden" animate="show" variants={board}>
              {word.split("").map((letter, index) => (
                <Letter key={index} small score={score(index)}>
                  {letter}
                </Letter>
              ))}
            </Board>
            <p className="text-sm text-center">
              {at !== null && <strong className="uppercase">{word[at]} </strong>}
              {text}
            </p>
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
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
          <DialogTitle>Hoe speel je {translations.title}?</DialogTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Raad het woord van {wordLength} letters in {boardSize} pogingen. Elke dag een nieuw woord.
          </p>
        </DialogHeader>
        <div className="space-y-5">
          <p className="text-sm">
            Typ een bestaand Nederlands woord en druk op{" "}
            <kbd className="px-1.5 py-0.5 bg-[var(--muted)] rounded-md font-sans text-xs font-bold">Enter</kbd>.
            De kleuren tonen hoe dicht je zit:
          </p>
          <Examples words={demoWords} />
          <Button onClick={closeHandler} className="w-full" size="lg">
            Speel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Splash;
