This is the source code for [Woordje.be](https://woordje.be).

Woordje is a Wordle clone, written in Next.js.

Basic architecture:

- [Next.js](https://nextjs.org)
- [Vercel.com](https://vercel.com/) serverless functions
- [Redux](https://redux.js.org)
- [Next-ui](https://nextui.org/)
- GraphQL
- [Prisma](https://www.prisma.io/)
- [PlanetScale](https://planetscale.com/)

Hosting for Woordje is kindly sponsored by [Vercel.com](https://vercel.com/).

[![Powered by Vercel](/public/images/powered-by-vercel.svg)](https://vercel.com/?utm_source=Woordje&utm_campaign=oss)

## Multiplayer

`/multiplayer` lets 2–8 players race on the same random word, in a room with friends
(share the 5 letter code or link; the host starts) or in an open game (quick match: once
a second player is in, it waits 15 seconds for more, then starts). Opponents see each
other's colours, not letters; fewest guesses wins, time breaks ties, and once
someone solves it the rest get 60 seconds.

The realtime part lives in [`multiplayer/`](multiplayer): a Cloudflare Worker
with one Durable Object per room (holds the secret word, scores guesses,
broadcasts state over WebSockets) and one matchmaker object per word length.
Vercel can't hold WebSockets open, so the browser connects to the Worker
directly. Room logic is pure JS in `multiplayer/src/game.js` and shares
`lib/score.js` and `data/woorden.json` with the daily game.

```sh
cd multiplayer && bun install
bun run dev:multiplayer   # worker on http://localhost:8787
bun run dev               # site, talks to localhost:8787 by default
bun run test:multiplayer  # room logic tests
```

Deploy with `cd multiplayer && bun run deploy`, then set
`NEXT_PUBLIC_MULTIPLAYER_URL` in Vercel to the worker URL. Allowed browser
origins are configured in `multiplayer/wrangler.jsonc` (`ALLOWED_ORIGINS`).
To test locally with two players, use a normal and a private window: the
player identity lives in localStorage, so two tabs are the same player.

### Multiplayer analytics (Rybbit custom events)

No names or room codes are sent, only counts and choices. Every player sends their own
events, so filter on `role = host` for one event per room.

| Event | Properties |
|---|---|
| `Multiplayer` | `action`: header / footer / results (entry clicks), create (+ `listed`), quick, join (code), join_list, quick_again |
| `Multiplayer Page` | `online`, `openRooms` when the multiplayer page loads |
| `Multiplayer Room Joined` | `kind` (private/quick), `role`, `players`, `maxPlayers`, `phase`, `listed`, `wordLength` |
| `Multiplayer Round Started` | `trigger` (timer / full for open games, host for friends), `round`, `players`, `waitedSeconds` (first game after joining) |
| `Multiplayer Round Finished` | `result` (won / solved / lost / forfeit), `guesses`, `seconds`, `players`, `round` |
| `Multiplayer Host` | `action`: start, length, listed, next_round |
| `Multiplayer Leaderboard` | `period` (week / all) when switching tabs |
| `Multiplayer Share` / `Multiplayer Idea` / `Multiplayer Left` / `Multiplayer Error` | method · use/refresh · phase · error code |

The "x spelers online" number, the list of open rooms and the high scores live in a
`Directory` Durable Object: rooms report their head count when it changes and each
finished round's scores (a point per opponent beaten; rounds only count when at least
two people guessed). The multiplayer page polls `GET /lobby` every 10 seconds and loads
`GET /leaderboard` once. Players are identified by a hash of their browser's secret token.
