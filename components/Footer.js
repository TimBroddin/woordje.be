"use client";

import NextLink from "next/link";
import Image from "next/image";
import { usePlausible } from "next-plausible";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useTranslations } from "@/lib/i18n/use-translations";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Sun, Moon } from "@/lib/icons";
import Show from "@/lib/iconly/Icons/Show";
import Hide from "@/lib/iconly/Icons/Hide";
import Danger from "@/lib/iconly/Icons/Danger";
import { Levels, Level } from "@/components/styled";
import GameStats from "@/components/GameStats";
import { getTodaysGameId } from "@/lib/gameId";
import { fetchRandomWord } from "@/lib/actions/random-word";

const Switch = ({ checked, onChange, iconOn, iconOff, "aria-label": ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange({ target: { checked: !checked } })}
    className={cn(
      "relative inline-flex h-8 w-14 items-center",
      "border-none rounded-full",
      "transition-all duration-200 ease-out",
      "shadow-inner",
      checked
        ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
        : "bg-[var(--border)]"
    )}
  >
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center",
        "bg-white rounded-full",
        "shadow-[var(--shadow-soft-sm)]",
        "transition-all duration-200 ease-out",
        checked ? "translate-x-7" : "translate-x-1"
      )}
    >
      {checked ? iconOn : iconOff}
    </span>
  </button>
);

const Footer = ({ gameId, wordLength: propWordLength, boardSize: propBoardSize }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const translations = useTranslations();
  const { randomWord, setRandomWord } = useUIStore();
  const { wordLength: storeWordLength, colorBlind, hardMode, setColorBlind, setHardMode } = useSettingsStore();

  const wordLength = propWordLength || storeWordLength;
  const plausible = usePlausible();
  const isArchive = gameId !== getTodaysGameId();

  return (
    <TooltipProvider>
      <div className="px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Game stats */}
          <div className="col-span-1 sm:col-span-2">
            <GameStats />
          </div>

          {/* Level selector or archive options */}
          <div className="min-w-0">
            {!isArchive ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">
                    Aantal letters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Levels>
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <NextLink href={`/speel/${level}`} key={`level-${level}`}>
                        {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                        }
                        <Level active={wordLength === level}>{level}</Level>
                      </NextLink>
                    ))}
                  </Levels>
                  <NextLink href="/archief">
                    {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                    }
                    <Button className="w-full" asChild>
                      <a>📁 Archief bekijken</a>
                    </Button>
                  </NextLink>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">
                    Ander Woordje?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-[var(--foreground)]">
                    Dit is een {translations.title} uit het archief.
                  </p>
                  <div className="flex flex-col gap-2">
                    <NextLink href="/">
                      {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                      }
                      <Button variant="outline" className="flex-1" asChild>
                        <a>🎯 Vandaag</a>
                      </Button>
                    </NextLink>
                    <NextLink href="/archief">
                      {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                      }
                      <Button variant="outline" className="flex-1" asChild>
                        <a>📁 Archief</a>
                      </Button>
                    </NextLink>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4 min-w-0">
            {/* Random word */}
            <Card
              className="cursor-pointer hover:shadow-[var(--shadow-soft-hover)] hover:-translate-y-1 transition-all duration-200 ease-out min-w-0 active:scale-[0.98]"
              onClick={async () => {
                const newWord = await fetchRandomWord(wordLength);
                setRandomWord(newWord);
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  🎲 Willekeurig woord
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-[var(--primary)] break-all" style={{ fontFamily: "var(--font-display)" }}>
                  {randomWord || "—"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Klik voor een nieuw woord
                </p>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  ⚙️ Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-[var(--foreground)] cursor-help">
                        Hoog contrast
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Handig voor kleurenblinden.</TooltipContent>
                  </Tooltip>
                  <Switch
                    checked={colorBlind}
                    aria-label="Hoog contrast"
                    onChange={() => setColorBlind(!colorBlind)}
                    iconOff={<Hide set="bold" size={12} />}
                    iconOn={<Show set="bold" size={12} />}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground)]">
                    Donkere modus
                  </span>
                  <Switch
                    checked={isDark}
                    onChange={(e) =>
                      setTheme(e.target.checked ? "dark" : "light")
                    }
                    iconOn={<Sun filled size={12} />}
                    iconOff={<Moon filled size={12} />}
                    aria-label="Donkere modus"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-[var(--foreground)] cursor-help">
                        Extra moeilijk
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Geraden letters moeten hergebruikt worden.
                    </TooltipContent>
                  </Tooltip>
                  <Switch
                    checked={hardMode}
                    onChange={(e) => {
                      plausible("HardMode", {
                        props: { value: e.target.checked },
                      });
                      setHardMode(e.target.checked);
                    }}
                    iconOn={<Danger filled size={12} />}
                    iconOff={<Danger set="light" size={12} />}
                    aria-label="Extra moeilijk"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About section */}
          <div className="col-span-1 sm:col-span-2">
            <Card className="bg-gradient-to-br from-[var(--primary)] via-[#a78bfa] to-[var(--accent)] border-none overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-sm font-bold text-white">
                  ✨ Over {translations.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-white/95">
                  Deze {translations.local} versie van{" "}
                  <a
                    className="text-white font-bold underline underline-offset-2 decoration-white/50 hover:decoration-white transition-all"
                    href="https://www.powerlanguage.co.uk/wordle/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Wordle
                  </a>{" "}
                  werd gemaakt door{" "}
                  <a
                    className="text-white font-bold underline underline-offset-2 decoration-white/50 hover:decoration-white transition-all"
                    href="https://www.titansofindustry.be/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Titans of Industry
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternate language link */}
        <p className="text-sm mt-6 text-center text-[var(--muted-foreground)]">
          {translations.alternate_cta} {translations.alternate_flag}{" "}
          <a
            rel="noreferrer"
            href={translations.alternate_url}
            className="font-bold text-[var(--primary)] hover:underline"
          >
            {translations.alternate_title}
          </a>
        </p>
      </div>
    </TooltipProvider>
  );
};

export default Footer;
