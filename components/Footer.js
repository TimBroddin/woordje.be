"use client";

import NextLink from "next/link";
import { useTheme } from "next-themes";
import { Archive, ChevronRight, RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/lib/analytics";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Levels, Level } from "@/components/styled";
import GameStats from "@/components/GameStats";
import ToggleRow from "@/components/ToggleRow";
import { getTodaysGameId } from "@/lib/gameId";
import { fetchRandomWord } from "@/lib/actions/random-word";
import BetaBadge from "@/components/BetaBadge";

const Section = ({ title, children, className }) => (
  <section className={cn("space-y-2", className)}>
    {title && (
      <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{title}</h2>
    )}
    {children}
  </section>
);

/** Rows inside one bordered group, separated by hairlines */
const List = ({ children }) => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
    {children}
  </div>
);

const rowClass = "flex items-center gap-3 px-4 py-3 min-h-14";

const LinkRow = ({ href, icon: Icon, title, badge, description, onClick }) => (
  <NextLink
    href={href}
    onClick={onClick}
    className={cn(rowClass, "no-underline text-inherit hover:bg-[var(--muted)] transition-colors duration-150")}
  >
    <Icon className="size-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
    <span className="flex-1 min-w-0">
      <span className="flex items-center gap-1.5 text-sm font-bold">
        {title}
        {badge}
      </span>
      <span className="block text-xs text-[var(--muted-foreground)]">{description}</span>
    </span>
    <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
  </NextLink>
);

const Footer = ({ gameId, wordLength: propWordLength }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const translations = useTranslations();
  const { randomWord, setRandomWord } = useUIStore();
  const { wordLength: storeWordLength, colorBlind, hardMode, setColorBlind, setHardMode } = useSettingsStore();

  const wordLength = propWordLength || storeWordLength;
  const track = useAnalytics();
  const isArchive = gameId !== getTodaysGameId();

  return (
    <footer className="px-4 pt-8 pb-10 space-y-7 lg:px-0 lg:pt-1">
      <GameStats />

      {isArchive ? (
        <Section title="Archief">
          <p className="px-1 text-sm">
            Dit is een {translations.title} uit het archief.{" "}
            <NextLink href="/" className="font-bold text-[var(--primary)]">
              Speel het woord van vandaag
            </NextLink>{" "}
            of{" "}
            <NextLink href="/archief" className="font-bold text-[var(--primary)]">
              kies een ander uit het archief
            </NextLink>
            .
          </p>
        </Section>
      ) : (
        <Section title="Aantal letters">
          <Levels>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <Level
                key={`level-${level}`}
                href={`/speel/${level}`}
                active={wordLength === level}
                aria-current={wordLength === level ? "page" : undefined}
                className="flex-1"
              >
                {level}
              </Level>
            ))}
          </Levels>
        </Section>
      )}

      <Section title="Meer spelen">
        <List>
          <LinkRow
            href="/multiplayer"
            icon={Users}
            title="Multiplayer"
            badge={<BetaBadge />}
            description="Raad hetzelfde woord als je vrienden, tegelijk"
            onClick={() => track("Multiplayer", { action: "footer" })}
          />
          {!isArchive && (
            <LinkRow
              href="/archief"
              icon={Archive}
              title="Archief"
              description="Speel de woorden van vorige dagen"
            />
          )}
          <div className={rowClass}>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold">Willekeurig woord</span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                Geen inspiratie voor een eerste gok?
              </span>
            </span>
            <span className="font-display text-lg font-semibold text-[var(--primary)] uppercase tracking-wide">
              {randomWord || "—"}
            </span>
            <button
              type="button"
              aria-label="Nieuw willekeurig woord"
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              onClick={async () => {
                const newWord = await fetchRandomWord(wordLength);
                setRandomWord(newWord);
              }}
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </List>
      </Section>

      <Section title="Instellingen">
        <List>
          <ToggleRow
            label="Hoog contrast"
            description="Oranje en blauw in plaats van groen en geel"
            checked={colorBlind}
            onChange={setColorBlind}
          />
          <ToggleRow label="Donkere modus" checked={isDark} onChange={(on) => setTheme(on ? "dark" : "light")} />
          <ToggleRow
            label="Extra moeilijk"
            description="Letters die je al vond, moet je opnieuw gebruiken"
            checked={hardMode}
            onChange={(on) => {
              track("HardMode", { value: on });
              setHardMode(on);
            }}
          />
        </List>
      </Section>

      <div className="px-1 space-y-2 text-sm text-[var(--muted-foreground)]">
        <p>
          {translations.title} is de {translations.local} versie van{" "}
          <a className="font-bold text-[var(--foreground)] underline" href="https://www.powerlanguage.co.uk/wordle/" rel="noreferrer" target="_blank">
            Wordle
          </a>
          , gemaakt door{" "}
          <a className="font-bold text-[var(--foreground)] underline" href="https://www.titansofindustry.be/" rel="noreferrer" target="_blank">
            Titans of Industry
          </a>
          .
        </p>
        <p>
          {translations.alternate_cta}
          <a rel="noreferrer" href={translations.alternate_url} className="font-bold text-[var(--foreground)] underline">
            {translations.alternate_title}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
