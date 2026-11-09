"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import copy from "copy-text-to-clipboard";
import { Crown, Link2, Loader2, LogOut, RefreshCw, Share2, Trophy, WifiOff } from "lucide-react";

import { Main } from "@/components/styled";
import Header from "@/components/Header";
import Keyboard from "@/components/Keyboard";
import Definition from "@/components/Definition";
import { Button } from "@/components/ui/button";
import GuessBoard from "@/components/multiplayer/GuessBoard";
import MiniBoard, { playerStatus } from "@/components/multiplayer/MiniBoard";
import WordLengthPicker from "@/components/multiplayer/WordLengthPicker";
import CodeTiles from "@/components/multiplayer/CodeTiles";
import { useRoom, useTicker } from "@/lib/multiplayer/use-room";
import { quickMatch } from "@/lib/multiplayer/api";
import { errorMessage, formatDuration } from "@/lib/multiplayer/messages";
import { saveName } from "@/lib/multiplayer/identity";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { trackEvent } from "@/lib/analytics";
import { useRandomWord } from "@/lib/multiplayer/use-random-word";
import ToggleRow from "@/components/ToggleRow";
import { cn } from "@/lib/utils";
import BetaBadge from "@/components/BetaBadge";

const CONFETTI_COLORS = ["#7c3aed", "#1f9e55", "#b98a10", "#a78bfa", "#ec4899"];

/**
 * Multiplayer funnel events (Rybbit). Only counts and choices: no names, no
 * room codes. Each player reports their own view, so "Round Started" counts
 * players, not rounds; filter on role=host for per-room numbers.
 */
function useRoomAnalytics(state, me, fatalError) {
  const seen = useRef({ joined: false, joinedAt: 0, waitTracked: false, startedRound: 0, finishedRound: 0 });

  useEffect(() => {
    if (fatalError) trackEvent("Multiplayer Error", { code: fatalError });
  }, [fatalError]);

  useEffect(() => {
    if (!state || !me) return;
    const s = seen.current;
    const online = state.players.filter((p) => p.connected).length;
    const base = {
      kind: state.isPublic ? "quick" : "private",
      role: state.hostId === me.id ? "host" : "guest",
      wordLength: state.wordLength,
      players: online,
    };

    if (!s.joined) {
      s.joined = true;
      s.joinedAt = Date.now();
      // Walked into a round that's already running or over: that one isn't ours
      s.startedRound = state.phase === "playing" ? state.round : 0;
      s.finishedRound = state.phase === "finished" || state.phase === "playing" ? state.round : 0;
      trackEvent("Multiplayer Room Joined", {
        ...base,
        maxPlayers: state.maxPlayers,
        phase: state.phase,
        listed: !!state.listed,
      });
    }

    if (state.phase === "playing" && state.round > s.startedRound) {
      s.startedRound = state.round;
      const props = { ...base, round: state.round, trigger: state.startTrigger ?? "unknown" };
      // How long people sit in the lobby before their first game (quick match: time to find opponents)
      if (!s.waitTracked) {
        s.waitTracked = true;
        props.waitedSeconds = Math.round((Date.now() - s.joinedAt) / 1000);
      }
      trackEvent("Multiplayer Round Started", props);
    }

    if (state.phase === "finished" && state.round > s.finishedRound) {
      s.finishedRound = state.round;
      if (me.playing) {
        const result =
          state.results?.winnerId === me.id ? "won" : me.solved ? "solved" : me.forfeit ? "forfeit" : "lost";
        trackEvent("Multiplayer Round Finished", {
          ...base,
          players: state.results?.ranking?.length ?? online,
          round: state.round,
          result,
          guesses: me.guesses.length,
          ...(me.solved ? { seconds: Math.round(me.solvedMs / 1000) } : {}),
        });
      }
    }
  }, [state, me]);
}

/** A random word as inspiration. Tap it to type it in (when `onUse` is given). */
function IdeaChip({ wordLength, onUse, showLabel = true }) {
  const [idea, refresh] = useRandomWord(wordLength);
  return (
    <div className="flex items-center gap-1 min-w-0 text-sm">
      {showLabel && (
        <span className="text-xs font-semibold text-[var(--muted-foreground)] shrink-0">Idee:</span>
      )}
      <button
        type="button"
        disabled={!onUse || !idea}
        onClick={() => {
          onUse(idea);
          trackEvent("Multiplayer Idea", { action: "use" });
        }}
        className="min-w-0 font-display font-semibold uppercase tracking-wide text-[var(--primary)] truncate disabled:cursor-default"
        aria-label={onUse ? `Vul ${idea} in` : undefined}
        title={onUse ? "Tik om dit woord in te vullen" : undefined}
      >
        {idea || "…"}
      </button>
      <button
        type="button"
        aria-label="Ander woord"
        onClick={() => {
          refresh();
          trackEvent("Multiplayer Idea", { action: "refresh" });
        }}
        className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
      >
        <RefreshCw className="size-3.5" />
      </button>
    </div>
  );
}

export default function RoomClient({ code }) {
  const room = useRoom(code);
  const { state, status, fatalError, notice } = room;
  const { colorBlind } = useSettingsStore();

  useEffect(() => {
    document.body.classList.toggle("colorblind", !!colorBlind);
  }, [colorBlind]);

  useEffect(() => {
    if (notice) toast.error(errorMessage(notice.code), { id: "mp-notice", duration: 2500 });
  }, [notice]);

  const me = state?.players.find((p) => p.id === state.you);
  const playing = state?.phase === "playing" && status !== "fatal";
  useRoomAnalytics(state, me, fatalError);

  let body;
  if (status === "fatal") body = <FatalState code={code} error={fatalError} />;
  else if (!state || !me) body = <Connecting code={code} />;
  // key: every round starts with an empty input row
  else if (state.phase === "playing") body = <PlayingView key={state.round} room={room} me={me} />;
  else if (state.phase === "finished") body = <FinishedView room={room} me={me} />;
  else body = <LobbyView room={room} me={me} />;

  return (
    // While playing the page is exactly one screen tall: no scrolling between board and keyboard
    <Main wide className={cn("lg:max-w-[960px]", playing && "flex flex-col min-h-0")}>
      {/* Mid-round every pixel goes to the boards and keyboard; PlayingView has its own slim bar */}
      {!playing && (
        <Header
          showHome
          backHref="/multiplayer"
          backLabel="Terug naar multiplayer"
          showInfo={false}
          showStats={false}
          customTitle={
            <span className="inline-flex items-center gap-2">
              Multiplayer <BetaBadge className="text-[11px]" />
            </span>
          }
          subtitle={
            state
              ? `${state.isPublic ? "Open spel" : `Kamer ${code}`} · ${state.wordLength} letters`
              : `Kamer ${code}`
          }
        />
      )}
      <Toaster />
      {status === "reconnecting" && (
        <div
          role="status"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft-lg)] text-sm font-semibold"
        >
          <WifiOff className="size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
          Verbinding herstellen…
        </div>
      )}
      {body}
    </Main>
  );
}

// ─── Small pieces ──────────────────────────────────────────────────────────

const SectionTitle = ({ children, aside }) => (
  <div className="flex items-baseline justify-between mb-2">
    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{children}</h2>
    {aside && (
      <span className="text-xs font-semibold text-[var(--muted-foreground)] tabular-nums">{aside}</span>
    )}
  </div>
);

const Panel = ({ className, children }) => (
  <div
    className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden", className)}
  >
    {children}
  </div>
);

function Connecting({ code }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-[var(--muted-foreground)]" role="status">
      <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      <p className="text-sm font-semibold">Verbinden met kamer {code}…</p>
    </div>
  );
}

const FATAL_COPY = {
  not_found: (code) => ({
    title: `Kamer ${code} bestaat niet`,
    text: "Controleer de code of vraag een nieuwe link. Lege kamers verdwijnen na een half uur.",
  }),
  full: () => ({
    title: "Deze kamer is vol",
    text: "Alle plekken in deze kamer zijn bezet. Maak zelf een kamer, of zoek andere spelers.",
  }),
};

function FatalState({ code, error }) {
  const copyFor = FATAL_COPY[error]?.(code) ?? { title: "Kon niet verbinden", text: errorMessage(error) };
  return (
    <div className="px-4 pt-8 space-y-4">
      <h2 className="font-display text-2xl font-semibold">{copyFor.title}</h2>
      <p className="text-sm text-[var(--muted-foreground)]">{copyFor.text}</p>
      <Button asChild className="w-full">
        <NextLink href="/multiplayer">Naar multiplayer</NextLink>
      </Button>
    </div>
  );
}

function remainingMs(state, serverNow) {
  return state.deadline ? state.deadline - serverNow() : 0;
}

function ShareButtons({ code }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/multiplayer/${code}` : "";
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => {
          if (copy(url)) toast.success("Link gekopieerd", { id: "mp-copy" });
          trackEvent("Multiplayer Share", { method: "copy" });
        }}
      >
        <Link2 /> Kopieer link
      </Button>
      {canShare && (
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            trackEvent("Multiplayer Share", { method: "native" });
            navigator
              .share({ title: "Woordje multiplayer", text: `Speel mee met Woordje! Kamercode: ${code}`, url })
              .catch(() => {});
          }}
        >
          <Share2 /> Deel
        </Button>
      )}
    </div>
  );
}

function NameEditor({ me, send }) {
  const [name, setName] = useState(me.name);

  const commit = () => {
    const clean = name.trim().slice(0, 16);
    if (!clean || clean === me.name) return setName(me.name);
    saveName(clean);
    send({ type: "rename", name: clean });
  };

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <label htmlFor="mp-room-name" className="text-sm font-bold shrink-0">
        Jouw naam
      </label>
      <input
        id="mp-room-name"
        className="flex-1 min-w-0 h-9 px-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] font-semibold focus:outline-none focus:border-[var(--primary)]"
        value={name}
        maxLength={16}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </div>
  );
}

function PlayerRows({ state, me }) {
  return state.players.map((p) => (
    <div
      key={p.id}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm",
        !p.connected && "text-[var(--muted-foreground)]",
      )}
    >
      <span className="font-bold truncate">{p.name}</span>
      {p.id === me.id && (
        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)]">
          jij
        </span>
      )}
      {p.isHost && !state.isPublic && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted-foreground)]">
          <Crown className="size-3.5" aria-hidden="true" /> host
        </span>
      )}
      {!p.connected && <span className="text-xs">· offline</span>}
      {p.wins > 0 && (
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold tabular-nums">
          <Trophy className="size-3.5 text-[var(--color-off)]" aria-hidden="true" /> {p.wins}
        </span>
      )}
    </div>
  ));
}

function CountdownOverlay({ seconds }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-[var(--background)]/90 pointer-events-none">
      <p className="text-sm font-bold text-[var(--muted-foreground)]">Het spel begint</p>
      <span
        key={seconds}
        className="font-display text-[96px] font-semibold leading-none tabular-nums animate-count"
      >
        {Math.max(1, seconds)}
      </span>
    </div>
  );
}

function LeaveButton({ room }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      onClick={() => {
        trackEvent("Multiplayer Left", {
          phase: room.state?.phase,
          kind: room.state?.isPublic ? "quick" : "private",
        });
        room.send({ type: "leave" });
        router.push("/multiplayer");
      }}
    >
      <LogOut className="size-4" aria-hidden="true" /> Verlaat kamer
    </button>
  );
}

// ─── Lobby ─────────────────────────────────────────────────────────────────

function LobbyView({ room, me }) {
  const { state, send, serverNow } = room;
  // waiting: open game's join timer · countdown: 3, 2, 1 after the host pressed start
  const timed = state.phase === "waiting" || state.phase === "countdown";
  useTicker(timed);

  const seconds = Math.max(0, Math.ceil(remainingMs(state, serverNow) / 1000));
  const isHost = state.hostId === me.id;
  const hostName = state.players.find((p) => p.isHost)?.name ?? "de host";
  const online = state.players.filter((p) => p.connected).length;
  const size = state.maxPlayers;
  const full = online >= size;
  const canConfigure = !state.isPublic && isHost && state.phase !== "countdown";

  // One heading and one sentence: where you are and what happens next
  let title;
  let text;
  if (state.isPublic) {
    if (timed) {
      title = `Start over ${seconds} s`;
      text = full
        ? "Het spel is vol. Maak je klaar!"
        : `${online} spelers doen mee. We wachten nog even op extra spelers.`;
    } else {
      title = "Tegenstanders zoeken…";
      text = `Zodra er een tegenstander met ${state.wordLength} letters is, wachten we nog 15 seconden op extra spelers. Ken je iemand? Stuur de link.`;
    }
  } else if (isHost) {
    title = "Nodig je vrienden uit";
    text =
      online < 2
        ? "Stuur ze de code of de link. Je kan starten zodra er iemand bij is."
        : full
          ? "Iedereen is er. Start het spel!"
          : `${online} van ${size} spelers. Start het spel zodra iedereen er is.`;
  } else {
    title = `Je zit in de kamer van ${hostName}`;
    text = `${hostName} start het spel zodra iedereen er is. Jullie krijgen allemaal hetzelfde woord van ${state.wordLength} letters.`;
  }

  return (
    // Desktop: invite on the left, players and settings on the right
    <div className="px-4 pb-12 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
      {timed && seconds <= 3 && <CountdownOverlay seconds={seconds} />}

      <div className="space-y-6">
        <div className="space-y-2" aria-live="polite">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2 tabular-nums">
            {!timed && state.isPublic && (
              <Loader2 className="size-5 animate-spin text-[var(--muted-foreground)]" aria-hidden="true" />
            )}
            {title}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">{text}</p>
        </div>

        {!state.isPublic && isHost && (
          <Button
            className="w-full"
            size="lg"
            disabled={online < 2 || state.phase === "countdown"}
            onClick={() => {
              send({ type: "start" });
              trackEvent("Multiplayer Host", { action: "start", players: online });
            }}
          >
            {online < 2 ? "Wacht op een tweede speler" : `Start met ${online} spelers`}
          </Button>
        )}

        {!state.isPublic && (
          <div className="space-y-3">
            <SectionTitle>Kamercode</SectionTitle>
            <CodeTiles text={state.code} />
            <ShareButtons code={state.code} />
          </div>
        )}
        {state.isPublic && !timed && <ShareButtons code={state.code} />}
      </div>

      <div className="space-y-6 mt-6 lg:mt-0">
        <div>
          <SectionTitle aside={`${online} / ${size}`}>Spelers</SectionTitle>
          <Panel className="divide-y divide-[var(--border)]">
            <PlayerRows state={state} me={me} />
            {/* key: picks up the name again when the server confirms a change */}
            <NameEditor key={me.name} me={me} send={send} />
          </Panel>
        </div>

        {canConfigure && (
          <div className="space-y-4">
            <div>
              <SectionTitle>Aantal letters</SectionTitle>
              <WordLengthPicker
                value={state.wordLength}
                onChange={(wordLength) => {
                  send({ type: "wordLength", wordLength });
                  trackEvent("Multiplayer Host", { action: "length", value: wordLength });
                }}
              />
            </div>
            <Panel>
              <ToggleRow
                label="Open kamer"
                description="Iedereen ziet je kamer in de lijst met open kamers en kan meedoen."
                checked={!!state.listed}
                onChange={(listed) => {
                  send({ type: "listed", listed });
                  trackEvent("Multiplayer Host", { action: "listed", value: listed });
                }}
              />
            </Panel>
          </div>
        )}

        <div>
          <SectionTitle>Idee voor je eerste gok</SectionTitle>
          <Panel className="px-4 py-1.5">
            <IdeaChip wordLength={state.wordLength} showLabel={false} />
          </Panel>
        </div>

        <LeaveButton room={room} />
      </div>
    </div>
  );
}

// ─── Playing ───────────────────────────────────────────────────────────────

function PlayingView({ room, me }) {
  const { state, request, serverNow } = room;
  const [inputText, setInputText] = useState("");
  const [pending, setPending] = useState(false);
  useTicker(true, 500);

  const { wordLength, maxGuesses } = state;
  const canType = me.playing && !me.done;


  const onPress = useCallback(
    (letter) =>
      setInputText((text) =>
        `${text}${letter}`
          .toLowerCase()
          .replace(/[^a-z]+/g, "")
          .slice(0, wordLength),
      ),
    [wordLength],
  );
  const onBackspace = useCallback(() => setInputText((text) => text.slice(0, -1)), []);
  const onSubmit = useCallback(async () => {
    if (pending || inputText.length !== wordLength) return;
    setPending(true);
    const result = await request({ type: "guess", word: inputText });
    setPending(false);
    if (result.error) {
      toast.error(errorMessage(result.error), { id: "mp-guess", duration: 2000 });
    } else {
      toast.dismiss("mp-guess");
      setInputText("");
    }
  }, [pending, inputText, wordLength, request]);

  const left = remainingMs(state, serverNow);
  const opponents = state.players.filter((p) => p.playing && p.id !== me.id);
  const spectators = state.players.filter((p) => !p.playing && p.connected);
  const firstSolver = state.players.filter((p) => p.solved).sort((a, b) => a.solvedMs - b.solvedMs)[0];

  let doneText = null;
  if (me.playing && me.done) {
    const n = me.guesses.length;
    doneText = me.solved
      ? `Geraden in ${n} ${n === 1 ? "poging" : "pogingen"}. Wachten op de anderen…`
      : "Je pogingen zijn op. Wachten op de anderen…";
  }

  return (
    // Desktop: board + keyboard on the left, opponents in a panel on the right
    <div className="flex-1 min-h-0 flex lg:gap-8 lg:px-4">
      <div className="flex-1 min-w-0 min-h-0 flex flex-col pb-2 lg:justify-center">
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 pt-3 pb-2 lg:px-0">
          <IdeaChip wordLength={wordLength} onUse={canType ? (word) => setInputText(word) : null} />
          <span
            role="timer"
            aria-label={`Nog ${formatDuration(left)}`}
            className={cn(
              "px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums whitespace-nowrap",
              state.hurry ? "bg-[var(--color-lost)] text-white" : "bg-[var(--muted)]",
            )}
          >
            {state.hurry && firstSolver && firstSolver.id !== me.id
              ? `${firstSolver.name} heeft het · nog ${formatDuration(left)}`
              : `Nog ${formatDuration(left)}`}
          </span>
        </div>

        {opponents.length > 0 && (
          <div className="shrink-0 lg:hidden">
            <p className="px-4 pb-1 text-[11px] font-semibold text-[var(--muted-foreground)] text-center">
              Je ziet de kleuren van je tegenstanders, niet hun letters
            </p>
            {/* One row that scrolls sideways, so 7 opponents don't push the keyboard off screen */}
            <div className="overflow-x-auto px-3 pb-2">
              <div className="flex gap-2 w-max mx-auto">
                {opponents.map((p) => (
                  <MiniBoard key={p.id} player={p} wordLength={wordLength} maxGuesses={maxGuesses} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* The board takes whatever height is left and sizes its tiles to fit */}
        <div className="mp-board-area flex-1 min-h-[120px] overflow-y-auto flex flex-col lg:flex-none lg:h-[min(62vh,540px)]">
          {/* m-auto rather than items-center: if it ever overflows, the top stays reachable */}
          <div className="m-auto">
            {me.playing ? (
              <GuessBoard
                guesses={me.guesses}
                wordLength={wordLength}
                maxGuesses={maxGuesses}
                inputText={inputText}
                active={canType}
                loading={pending}
              />
            ) : (
              <p className="px-6 text-center text-sm text-[var(--muted-foreground)]">
                Deze ronde was al bezig toen je binnenkwam. Je kijkt mee en speelt mee vanaf de volgende
                ronde.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {canType ? (
            <Keyboard guesses={me.guesses} onPress={onPress} onBackspace={onBackspace} onSubmit={onSubmit} />
          ) : (
            doneText && (
              <p className="text-center text-sm font-bold my-4 px-4" aria-live="polite">
                {doneText}
              </p>
            )
          )}
          {spectators.length > 0 && (
            <p className="text-xs text-center text-[var(--muted-foreground)] mt-1">
              Kijken mee: {spectators.map((p) => p.name).join(", ")}
            </p>
          )}
        </div>
      </div>

      {opponents.length > 0 && (
        <aside className="hidden lg:flex flex-col w-[300px] shrink-0 pt-4 pb-4 min-h-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Tegenstanders
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-3">
            Je ziet hun kleuren, niet hun letters.
          </p>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto content-start">
            {opponents.map((p) => (
              <MiniBoard key={p.id} player={p} wordLength={wordLength} maxGuesses={maxGuesses} size="lg" />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

// ─── Results ───────────────────────────────────────────────────────────────

function FinishedView({ room, me }) {
  const { state, send } = room;
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [searching, setSearching] = useState(false);

  const byId = Object.fromEntries(state.players.map((p) => [p.id, p]));
  const ranking = (state.results?.ranking ?? []).map((id) => byId[id]).filter(Boolean);
  const winner = byId[state.results?.winnerId];
  const isHost = state.hostId === me.id;
  const host = state.players.find((p) => p.isHost);
  const online = state.players.filter((p) => p.connected).length;
  const iWon = winner?.id === me.id;
  const standings = [...state.players].sort((a, b) => b.wins - a.wins);
  // Same rule as the server: a point per opponent beaten, only if two people really played
  const counted = ranking.filter((p) => p.guesses.length > 0).length >= 2;
  const myIndex = ranking.findIndex((p) => p.id === me.id);
  const myPoints = me.solved && myIndex !== -1 ? ranking.length - 1 - myIndex : 0;

  const findNewGame = async () => {
    setSearching(true);
    trackEvent("Multiplayer", { action: "quick_again", wordLength: state.wordLength });
    try {
      const code = await quickMatch(state.wordLength);
      router.push(`/multiplayer/${code}`);
    } catch {
      toast.error("Kon geen nieuw spel vinden. Probeer het zo opnieuw.", { id: "mp" });
      setSearching(false);
    }
  };

  return (
    // Mobile: outcome, boards, then what's next. Desktop: outcome + next left, boards right.
    <div className="px-4 pb-12 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-12 lg:grid-rows-[auto_1fr] lg:items-start">
      {iWon && (
        <Confetti
          key={state.round}
          numberOfPieces={160}
          colors={CONFETTI_COLORS}
          recycle={false}
          width={width}
          height={height}
          initialVelocityY={-20}
        />
      )}

      <div className="space-y-7">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">
              {iWon ? "Jij wint!" : winner ? `${winner.name} wint` : "Niemand vond het woord"}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">Ronde {state.round} · het woord was</p>
            {counted && me.playing && (
              <p className="text-sm">
                <strong className="text-[var(--primary)]">
                  {myPoints > 0 ? `+${myPoints} ${myPoints === 1 ? "punt" : "punten"}` : "Geen punten"}
                </strong>{" "}
                voor de{" "}
                <NextLink href="/multiplayer#hoogste-scores" className="font-semibold underline">
                  hoogste scores
                </NextLink>
              </p>
            )}
          </div>
          <CodeTiles text={state.word} score="good" />
          <Definition word={state.word} />
        </div>

        <div>
          <SectionTitle>Uitslag</SectionTitle>
          <Panel className="divide-y divide-[var(--border)]">
            {ranking.map((p, i) => {
              const status = playerStatus(p, { finished: true, maxGuesses: state.maxGuesses });
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm",
                    p.id === me.id && "bg-[var(--primary-soft)]",
                  )}
                >
                  <span className="w-5 text-right font-bold tabular-nums text-[var(--muted-foreground)]">
                    {p.solved ? i + 1 : "–"}
                  </span>
                  <span className="font-bold truncate">{p.name}</span>
                  {p.id === winner?.id && (
                    <Trophy className="size-4 shrink-0 text-[var(--color-off)]" aria-label="winnaar" />
                  )}
                  <span
                    className={cn(
                      "ml-auto text-xs font-semibold tabular-nums whitespace-nowrap",
                      status.tone === "good"
                        ? "text-[var(--color-good-text)]"
                        : "text-[var(--muted-foreground)]",
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </Panel>
        </div>
      </div>

      {ranking.length > 0 && (
        <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          {ranking.map((p) => (
            <MiniBoard
              key={p.id}
              player={p}
              wordLength={state.wordLength}
              maxGuesses={state.maxGuesses}
              highlight={p.id === winner?.id}
              finished
              reveal
            />
          ))}
        </div>
      )}

      <div className="space-y-7 lg:col-start-1 lg:row-start-2">
        {!state.isPublic && state.round > 1 && (
          <div>
            <SectionTitle aside={`na ${state.round} rondes`}>Stand</SectionTitle>
            <Panel className="divide-y divide-[var(--border)]">
              {standings.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="font-bold truncate">{p.name}</span>
                  <span className="ml-auto text-xs font-bold tabular-nums">
                    {p.wins} {p.wins === 1 ? "ronde" : "rondes"} gewonnen
                  </span>
                </div>
              ))}
            </Panel>
          </div>
        )}

        <div className="space-y-3">
          {state.isPublic ? (
            <Button className="w-full" size="lg" disabled={searching} onClick={findNewGame}>
              {searching && <Loader2 className="animate-spin" />}
              Zoek nieuwe tegenstanders
            </Button>
          ) : isHost ? (
            <>
              <SectionTitle>Volgende ronde</SectionTitle>
              <WordLengthPicker
                value={state.wordLength}
                onChange={(wordLength) => send({ type: "wordLength", wordLength })}
              />
              <Button
                className="w-full"
                size="lg"
                disabled={online < 2}
                onClick={() => {
                  send({ type: "start" });
                  trackEvent("Multiplayer Host", { action: "next_round", players: online });
                }}
              >
                Start ronde {state.round + 1}
              </Button>
              {online < 2 && (
                <p className="text-xs text-center text-[var(--muted-foreground)]">
                  Iedereen is vertrokken. Deel de link om nieuwe spelers uit te nodigen.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-center text-[var(--muted-foreground)]" aria-live="polite">
              Wachten tot {host?.name ?? "de host"} de volgende ronde start…
            </p>
          )}
          {!state.isPublic && <ShareButtons code={state.code} />}
        </div>

        <LeaveButton room={room} />
      </div>
    </div>
  );
}
