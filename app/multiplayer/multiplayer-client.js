"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Globe, Loader2, Users } from "lucide-react";

import { Main } from "@/components/styled";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import WordLengthPicker from "@/components/multiplayer/WordLengthPicker";
import ToggleRow from "@/components/ToggleRow";
import Leaderboard from "@/components/multiplayer/Leaderboard";
import { useLobby } from "@/lib/multiplayer/use-lobby";
import { useNow } from "@/lib/multiplayer/use-room";
import { useAnalytics } from "@/lib/analytics";
import { createRoom, quickMatch } from "@/lib/multiplayer/api";
import { isValidCode } from "@/lib/multiplayer/config";
import {
  getName,
  saveName,
  randomName,
  getPreferredLength,
  savePreferredLength,
} from "@/lib/multiplayer/identity";
import { cn } from "@/lib/utils";
import BetaBadge from "@/components/BetaBadge";

const inputClass = cn(
  "w-full h-11 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)]",
  "text-[var(--foreground)] font-semibold placeholder:text-[var(--muted-foreground)] placeholder:font-normal",
  "focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-soft)]",
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-bold mb-1.5">
    {children}
  </label>
);

const ModeCard = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
    <div className="flex items-center gap-2.5">
      <span className="h-9 w-9 shrink-0 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] inline-flex items-center justify-center">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </section>
);

/** "5 spelers online · 2 aan het spelen". The count includes you (you're browsing). */
function OnlineNow({ lobby }) {
  if (!lobby) return <p className="h-5" aria-hidden="true" />;
  const { online, playing } = lobby;
  return (
    <p className="flex items-center gap-2 text-sm font-semibold">
      <span className="size-2 rounded-full bg-[var(--color-good)]" aria-hidden="true" />
      {online <= 1 ? (
        "Alleen jij bent nu online. Nodig iemand uit!"
      ) : (
        <span>
          {online} spelers online
          {playing > 0 && (
            <span className="font-normal text-[var(--muted-foreground)]"> · {playing} aan het spelen</span>
          )}
        </span>
      )}
    </p>
  );
}

function OpenRooms({ lobby, onJoin }) {
  const rooms = lobby?.rooms ?? [];
  const now = useNow(rooms.some((r) => r.deadline), 1000) + (lobby?.clockOffset ?? 0);

  return (
    <section className="space-y-2" aria-labelledby="open-rooms">
      <h2
        id="open-rooms"
        className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]"
      >
        Open kamers
      </h2>
      {!lobby ? (
        <p className="text-sm text-[var(--muted-foreground)]">Kamers laden…</p>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Er zijn nu geen open kamers. Maak er zelf een en zet &lsquo;Open kamer&rsquo; aan, of zoek
          tegenstanders.
        </p>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
          {rooms.map((room) => {
            const seconds = room.deadline ? Math.max(0, Math.ceil((room.deadline - now) / 1000)) : null;
            return (
              <div key={room.code} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">
                    {room.kind === "quick" ? "Open spel" : `Kamer van ${room.host ?? "iemand"}`}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] tabular-nums">
                    {room.wordLength} letters · {room.online}/{room.maxPlayers} spelers ·{" "}
                    {seconds !== null ? `start over ${seconds} s` : "wacht op spelers"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label={`Doe mee met ${room.kind === "quick" ? "open spel" : `kamer van ${room.host ?? "iemand"}`}`}
                  onClick={() => onJoin(room)}
                >
                  Doe mee
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const noSubscribe = () => () => {};
/** A localStorage preference: the default while rendering on the server, the stored value in the browser. */
const useStored = (read, fallback) => useSyncExternalStore(noSubscribe, read, () => fallback);

export default function MultiplayerClient() {
  const router = useRouter();
  const track = useAnalytics();
  // What's typed or picked on this page wins over what's stored from last time
  const storedName = useStored(getName, "");
  const [nameDraft, setNameDraft] = useState(null);
  const name = nameDraft ?? storedName;
  const storedLength = useStored(getPreferredLength, 5);
  const [lengthChoice, setWordLength] = useState(null);
  const wordLength = lengthChoice ?? storedLength;
  const [listed, setListed] = useState(false);
  const lobby = useLobby();
  const viewTracked = useRef(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(null); // "quick" | "create" | null

  // One page view event with the context we care about: is anyone around?
  useEffect(() => {
    if (!lobby || viewTracked.current) return;
    viewTracked.current = true;
    track("Multiplayer Page", { online: lobby.online, openRooms: lobby.rooms.length });
  }, [lobby, track]);

  const commitName = () => {
    saveName(name.trim().slice(0, 16) || randomName());
    setNameDraft(null); // fall back to the stored (cleaned) name
  };

  const go = async (kind) => {
    commitName();
    savePreferredLength(wordLength);
    setBusy(kind);
    try {
      const roomCode =
        kind === "quick" ? await quickMatch(wordLength) : await createRoom(wordLength, listed);
      track(
        "Multiplayer",
        kind === "quick"
          ? { action: "quick", wordLength }
          : { action: "create", wordLength, listed },
      );
      router.push(`/multiplayer/${roomCode}`);
    } catch {
      toast.error("De multiplayer-server is niet bereikbaar. Probeer het zo opnieuw.", { id: "mp" });
      setBusy(null);
    }
  };

  const join = (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!isValidCode(clean)) {
      toast.error("Een kamercode bestaat uit 5 letters", { id: "mp" });
      return;
    }
    commitName();
    track("Multiplayer", { action: "join" });
    router.push(`/multiplayer/${clean}`);
  };

  const joinListed = (room) => {
    commitName();
    track("Multiplayer", { action: "join_list", kind: room.kind, wordLength: room.wordLength });
    router.push(`/multiplayer/${room.code}`);
  };

  const quickWaiting = (lobby?.rooms ?? [])
    .filter((r) => r.kind === "quick" && r.wordLength === wordLength)
    .reduce((sum, r) => sum + r.online, 0);

  return (
    <Main wide className="lg:max-w-[960px]">
      <Header
        showHome
        showInfo={false}
        showStats={false}
        customTitle={
          <span className="inline-flex items-center gap-2">
            Multiplayer <BetaBadge className="text-[11px]" />
          </span>
        }
      />
      <Toaster />

      {/* Mobile: intro, ways to play, rules. Desktop: intro + rules left, ways to play right. */}
      <div className="px-4 pb-12 grid gap-6 lg:grid-cols-2 lg:gap-x-12 lg:grid-rows-[auto_1fr] lg:items-start">
        <div className="space-y-6">
          <p className="text-[15px] leading-relaxed lg:text-lg">
            Iedereen in de kamer raadt <strong>hetzelfde woord</strong>, tegelijk. Wie het met de minste
            pogingen vindt, wint.
          </p>
          <OnlineNow lobby={lobby} />

          <div className="space-y-4">
            <div>
              <Label htmlFor="mp-name">Jouw naam</Label>
              <input
                id="mp-name"
                className={inputClass}
                value={name}
                maxLength={16}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                autoComplete="nickname"
              />
            </div>
            <div>
              <span className="block text-sm font-bold mb-1.5">Aantal letters</span>
              <WordLengthPicker value={wordLength} onChange={setWordLength} />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <ModeCard icon={Users} title="Met vrienden">
            <p className="text-sm text-[var(--muted-foreground)]">
              Maak een kamer voor maximaal 8 spelers en stuur de code naar je vrienden. Jij start het spel zodra iedereen er is.
            </p>
            <ToggleRow
              className="px-0 py-1 min-h-0"
              label="Open kamer"
              description="Zet je kamer in de lijst hieronder, zodat iedereen kan meedoen."
              checked={listed}
              onChange={setListed}
            />
            <Button className="w-full" disabled={!!busy} onClick={() => go("create")}>
              {busy === "create" && <Loader2 className="animate-spin" />}
              Maak een kamer
            </Button>
            <form className="pt-3 border-t border-[var(--border)]" onSubmit={join}>
              <Label htmlFor="mp-code">Kreeg je een code?</Label>
              <div className="flex gap-2">
                <input
                  id="mp-code"
                  className={cn(
                    inputClass,
                    "uppercase tracking-[0.25em] font-display placeholder:normal-case placeholder:tracking-normal placeholder:font-sans",
                  )}
                  value={code}
                  maxLength={5}
                  onChange={(e) => setCode(e.target.value.replace(/[^a-z]/gi, "").toUpperCase())}
                  placeholder="bv. KABOM"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Button type="submit" variant="outline" className="shrink-0">
                  Doe mee
                </Button>
              </div>
            </form>
          </ModeCard>

          <ModeCard icon={Globe} title="Tegen andere spelers">
            <p className="text-sm text-[var(--muted-foreground)]">
              We zoeken spelers die nu online zijn en ook {wordLength} letters kozen. Zodra er een
              tegenstander is, wachten we nog 15 seconden op extra spelers.
            </p>
            {quickWaiting > 0 && (
              <p className="text-sm font-semibold text-[var(--color-good-text)]">
                {quickWaiting === 1 ? "Er wacht al iemand" : `Er wachten al ${quickWaiting} spelers`} met{" "}
                {wordLength} letters: je speelt meteen.
              </p>
            )}
            <Button className="w-full" variant="outline" disabled={!!busy} onClick={() => go("quick")}>
              {busy === "quick" && <Loader2 className="animate-spin" />}
              Zoek tegenstanders
            </Button>
          </ModeCard>

          <OpenRooms lobby={lobby} onJoin={joinListed} />
        </div>

        <div className="space-y-8 lg:col-start-1 lg:row-start-2">
          <Leaderboard />

          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Spelregels
            </h2>
            <ul className="text-sm space-y-2 list-disc pl-5 marker:text-[var(--border-strong)]">
              <li>Elke ronde krijgt een eigen woord, los van het woord van de dag.</li>
              <li>Je ziet de kleuren van je tegenstanders, maar niet hun letters.</li>
              <li>Minste pogingen wint. Bij een gelijke stand wint wie het eerst had.</li>
              <li>Voor de hoogste scores krijg je een punt voor elke speler die je verslaat.</li>
              <li>
                Zodra iemand het woord vindt, heeft de rest nog 60 seconden. Een ronde duurt hoogstens 4
                minuten.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Main>
  );
}
