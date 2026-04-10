# Wonderful Game backend API

Base URL: `http://<host>:2988` (default port `2988`, overridable with `PORT`).

Every route below is also available under the `/api` prefix (e.g. `GET /skills` and `GET /api/skills`) so the app works behind a reverse proxy that forwards `/api/*` without stripping the prefix.

## Authentication (POST requests)

POST endpoints require the **Life Master PIN**, same as `POST /skills`, `POST /state`, `POST /xp/sub-skill`, and `POST /tasks/complete`.

Send the PIN in any of these ways:

| Method | How |
|--------|-----|
| Header | `X-Life-Master-Pin: <pin>` |
| Header | `Authorization: Bearer <pin>` |
| Query | `?pin=<pin>` |
| JSON body | `"pin": "<pin>"` (alongside other fields) |
| Form body | `pin=<pin>` (e.g. NFC Tools POST parameters) |

GET requests do not require authentication.

### Pending stars (per player)

- **`GET /api/players/:playerName/pending-stars`** (or **`GET /players/:playerName/pending-stars`** on the Node server) — Whether this player has **pending stars** (earned but not yet banked in the jar). Response: `{ "pending": true }` or `{ "pending": false }`. **`404`** if the player does not exist. The `:playerName` segment should be URL-encoded if it contains spaces or special characters.

**Production / reverse proxies:** If you get **HTML** (the React app shell) instead of JSON, the request is hitting the static site only. Use the **`/api/`** URL (e.g. `https://your-domain.com/api/players/Player%20One/pending-stars` — URL-encode spaces in player names) and ensure your proxy forwards **`/api/*`** to the Node process (same as `GET /api/state`).

**`lifeMasterPin` is never returned** in `GET /state` or `POST /state` responses (or any JSON response). It is only stored on disk and checked server-side. To confirm a PIN without exposing it, use **`POST /auth/verify-life-master`** (see below).

## Endpoints

### State

- **`GET /state`** — Full JSON state (skills, players, XP, tasks, chores, coins, quests, etc.). **Omits `lifeMasterPin`.**
- **`POST /state`** — Merge/replace fields from JSON body and persist. Use for backups or bulk edits. Response body also **omits `lifeMasterPin`** (you may still send `lifeMasterPin` in the POST body to update the stored PIN when authenticated).

### Life Master login (no PIN in response)

- **`POST /auth/verify-life-master`** — JSON body: `{ "pin": "<attempt>" }`. Returns `{ "ok": true }` if it matches the stored Life Master PIN, **`401`** if not, **`400`** if `pin` is missing. This route does **not** use PIN-in-header auth (it *is* the PIN check). Intended for the SPA; avoid exposing it on untrusted networks without HTTPS and rate limiting.

### Skills

- **`GET /skills`** — Array of skill definitions.
- **`POST /skills`** — Create a skill or add a sub-skill. Body: `{ "name": "Reading", "subSkill": "Comprehension" }` (sub-skill optional).

### XP & tasks

- **`GET /tasks`** (and **`GET /api/tasks`**) — List all skill tasks with ids, display names, and skill linkage. Response: `{ "tasks": [ { "id": "<taskId>", "name": "<title>", "skillName": "<skill>", "subSkillName": "<sub>" | null }, ... ] }`. If a task has no title, `name` is the same as `id`. `skillName` may be an empty string if unset; `subSkillName` is `null` when absent.

- **`POST /xp/sub-skill`** — Add pending XP to a sub-skill. Body: `playerName`, `skillName`, `subSkillName`, `amount`, optional `whatHappened`.
- **`POST /tasks/complete`** — Complete a task by id; applies task XP (and stars if configured). Body: `playerName`, `taskId`, optional `whatHappened`.

### Chores

- **`GET /chores/summary`** (and **`GET /api/chores/summary`**) — Compact list for integrations (e.g. NFC labels). Response: `{ "chores": [ { "choreId": "<id>", "name": "<title>", "room": "<room>" }, ... ] }`. Same ids as **`POST /chores/complete`** body field **`choreId`**.

- **`GET /chores`** — Full array of chore definitions (same objects the React app uses: `id`, `title`, `room`, `schedule`, `effortStars`, optional `skillName`, `xpReward`, `starReward`, `assignedQuestTo`, `questOnly`). **`xpReward` is derived from `effortStars`** (1→25, 2→50, 3→100, 4→150, 5→250 XP) and is kept in sync on load and when applying `POST /state`.

- **`POST /chores`** — Create a chore (auth required). JSON body:
  - **Required:** `title`, `room`, `schedule` (`daily` | `weekly` | `monthly`).
  - **Optional:** `id` (otherwise generated), `effortStars` (1–5, default 1), `skillName`, `starReward`, `assignedQuestTo`, `questOnly`. **`xpReward` is ignored**; it is set from `effortStars` using the mapping above.
  - Response: updated full `chores` array.

- **`POST /chores/complete`** — Record one completion for a player (auth required). Enforces the same rules as the app: one completion per chore per period (day/week/month), quest-only chores only if listed for that player today, and `assignedQuestTo` must match when set.

  Body: `playerName`, **`choreId`** (string — the chore’s `id` from **`GET /chores`** or **`GET /api/chores`**, not the title). Same route with **`/api`** prefix: `POST /api/chores/complete`.

  Effects: appends to `choreActivity`, adds **pending** coins from `effortCoinsByStar`, optional pending stars, optional **pending** XP on the skill when the chore has `skillName` (XP amount follows `effortStars` → `xpReward`), with the same sub-skill splitting and access rules as the UI.

- **`POST /chores/delete`** — Remove a chore by id (auth required). Body: `choreId`. Response: updated `chores` array.

### Daily quests

- **`POST /quests/today`** — Update today’s quest chore ids for a player (auth required).

  Either:

  - **`choreIds`**: array of chore ids — **sets** today’s list for `playerName` to exactly this list (all ids must exist), or
  - **`addChoreId`**: single chore id — **appends** to today’s list and marks that chore with `assignedQuestTo` and `questOnly: true` (same as “Assign quest” in Manage Tasks).

  Always required: `playerName`.

## Examples

```bash
# List chores (full)
curl http://localhost:2988/chores

# List chores (id, name, room only — for NFC / scripts)
curl -s http://localhost:2988/chores/summary
curl -s http://localhost:2988/api/chores/summary

# Create a daily chore (PIN in query)
curl -X POST "http://localhost:2988/chores?pin=1111" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dishes","room":"Kitchen","schedule":"daily","effortStars":2,"skillName":"Life Skills"}'

# Complete a chore for a player
curl -X POST "http://localhost:2988/chores/complete?pin=1111" \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alex","choreId":"chore_1700000000000_abc12"}'

# Add today’s quest for a player
curl -X POST "http://localhost:2988/quests/today?pin=1111" \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alex","addChoreId":"chore_1700000000000_abc12"}'
```

## Production troubleshooting (HTML instead of JSON)

If **`curl -s https://your-domain/api/state | head -c 1`** prints `<` (HTML) instead of `{` (JSON), **no API traffic is reaching Node**. The site is serving only the static SPA (or a CDN) for those paths.

**Checks**

1. On the machine where Node runs: `curl -s http://127.0.0.1:2988/api/state | head -c 1` — should be `{`. If it is, fix the public reverse proxy; if not, run the app from `docker-compose` (or `node server/server.js`) with `STATIC_DIR` pointing at the built client.
2. Point **`/api/`** at Node. Example **nginx** (adjust upstream port/host):

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:2988;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Use `proxy_pass http://127.0.0.1:2988;` (with trailing URI from the client preserved) so the backend receives `/api/...` as registered in Express. Avoid serving the React `build/` folder as the only root without a proxy to Node for `/api`.

## Data directory

Persisted file: `DATA_DIR/state.json` (default `server/data/state.json`). Set `DATA_DIR` to override.
