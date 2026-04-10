# Wonderful Game

**Wonderful Game** is a local-first web app for families: track **skills** and **sub-skills**, earn **XP** and **levels**, complete **chores** and **daily quests**, collect **coins** and **stars**, redeem **rewards** (including **screen time**), and show progress on a customizable **showcase**.  

A React SPA talks to a small **Express** server; **all data** lives in one JSON file (`state.json`). The same server exposes a **REST API** for automation, NFC, scripts, and integrations (see [API](#http-api) below).

The recommended way to run it is **Docker**: one container serves the API **and** the static UI on **port 2988** (no separate `/api` host or proxy path required for the single-app build).

---

## Screenshots

Images live in [`docs/screenshots/`](docs/screenshots/). The repo ships with **gray placeholder PNGs** so the layout always renders; **replace them** with real captures (same filenames) for your GitHub page. See [`docs/screenshots/README.md`](docs/screenshots/README.md).

| | |
| --- | --- |
| ![Overview](docs/screenshots/01-overview.png) | ![Chores](docs/screenshots/02-chores.png) |
| **Overview** — stars, coins, player progress | **Chores** — quests, chores by room, rewards |
| ![Skills](docs/screenshots/03-skills.png) | ![Rewards](docs/screenshots/04-rewards.png) |
| **Skills** — XP, skills tree, tasks, board | **Rewards** — store, screen time, redemptions |

<p align="center">
  <img src="docs/screenshots/05-showcase.png" alt="Showcase dashboard" width="720" />
</p>

<p align="center"><em>Showcase — customizable dashboard tiles.</em></p>

---

## What you can do in the app

### Roles and access

- **Life Master** — full control: settings, players, skills, chores, rewards, XP grants, pins.
- **Player** — sign in with a per-player PIN; see skills, chores, and rewards allowed for that profile.
- **Overview** / **Weekly Review** — read-focused views for summaries (depending on how you configure sessions).

### Main areas (top navigation)

- **Chores** — chore lists by **room**, **daily / weekly / monthly** schedules, **effort** levels, **quests** for the day, **coins** and **stars** from chores, chore-specific **skill** links.
- **Skills** — **Home**, **Skills** tree (categories and sub-skills), **Tasks** (Life Master), **Board** (leader-style view), **Activity** (XP log), **Achievements**, **Rewards Store**, **Rewards** (redemptions, **screen time** timer), **Reward Requests**.
- **Showcase** — draggable **grid** of tiles (stars, streak, coins, achievements, skill highlights, etc.).
- **Rules** — editable **house rules** page (themes, sections).

### Gameplay and economy

- **XP** and **levels** (with a level cap on the server), **skill points** and **skill tree** unlocks.
- **Stars** (pending, earned, banked) and **star rewards**; **coins** and **coin rewards**; **reward requests** and approval flows.
- **Screen time** bank from **rewards**, with a **session timer** (per-turn limits, favorite-color dial).
- **Chore themes** (e.g. unicorns, trucks), **chore skills** (separate skill list for chore UI), **images** and **icons** for skills.

### Mobile shell

An **Android** WebView shell in [`android-app/`](android-app/) can point at your server URL for a home-screen experience (optional).

---

## HTTP API

The backend is a **JSON REST API** on the same port as the web app (default **2988**).

- **Base URL:** `http://<host>:2988` — routes also work under **`/api/...`** (e.g. `GET /skills` and `GET /api/skills`) so reverse proxies can forward `/api` only if needed.
- **GET** requests are **unauthenticated** (read-only data).
- **POST** requests that change state require the **Life Master PIN** via header (`X-Life-Master-Pin`), `Authorization: Bearer`, query `?pin=`, or JSON body — see full docs.

**Examples of what the API exposes:**

| Area | Examples |
|------|-----------|
| State | `GET /state`, `POST /state` (PIN, backup/merge) |
| Auth | `POST /auth/verify-life-master` |
| Skills & XP | `GET /skills`, `POST /skills`, `POST /xp/sub-skill` |
| Tasks | `GET /tasks`, `POST /tasks/complete` |
| Chores | `GET /chores`, `GET /chores/summary`, `POST /chores`, `POST /chores/complete`, `POST /chores/delete` |
| Quests | `POST /quests/today` |
| Players | `GET /api/players/:playerName/pending-stars` |

Full reference, **curl** examples, and **reverse-proxy** notes: **[`server/API.md`](server/API.md)**.

---

## Run with Docker Compose (recommended)

### 1. Configure where data is stored on your machine

Game data (`state.json`) is kept in a **host folder** mounted into the container at `/data`.

1. Copy the example env file and edit it:

   ```bash
   cp .env.example .env
   ```

2. Open **`.env`** and set **`HOST_DATA_PATH`** to an absolute directory on your machine (create the directory if needed). Example:

   ```bash
   HOST_DATA_PATH=/mnt/storage/Services/Wonderful-Game
   ```

   Use a path that exists (or that you can create) and that Docker can read/write. On Windows with Docker Desktop, use a path your engine allows (often under your user profile or a shared drive).

The repository **does not** commit `.env` (it is listed in `.gitignore`). Only **`.env.example`** is tracked as a template.

### 2. Start the stack

From the repository root:

```bash
docker compose up -d --build
```

(`docker-compose up` works too on older Docker installs.)

Then open **http://localhost:2988** in your browser.

- **Stop:** `docker compose down`
- **Logs:** `docker compose logs -f`

If `HOST_DATA_PATH` is missing from `.env`, Compose falls back to **`./data`** in the project root (same directory as `docker-compose.yml`).

---

## Run with Docker only (no Compose)

Build the image from the **root** `Dockerfile`:

```bash
docker build -t wonderful-game .
```

Run with a bind mount (set your path or export from `.env`):

```bash
docker run -d --name wonderful-game -p 2988:2988 \
  -e PORT=2988 \
  -e DATA_DIR=/data \
  -e STATIC_DIR=/app/client/build \
  -v /mnt/storage/Services/Wonderful-Game:/data \
  wonderful-game
```

Adjust `-v` to match your `HOST_DATA_PATH`. Open **http://localhost:2988**.

---

## Environment variables

### Docker Compose (project root `.env`)

| Variable          | Description |
|-------------------|-------------|
| `HOST_DATA_PATH`  | Host directory mounted as `/data` in the container (where `state.json` lives). |

### Inside the container (set by Compose / image)

| Variable     | Default | Description |
|--------------|---------|-------------|
| `PORT`       | `2988`  | HTTP port inside the container. |
| `DATA_DIR`   | `/data` in Compose | Where `state.json` is written inside the container. |
| `STATIC_DIR` | `/app/client/build` in the image | Path to the React production build. |

See [`server/server.js`](server/server.js) for details.

---

## Development without Docker

Use two terminals:

1. **API:** `cd server && npm install && npm start` (default **http://localhost:2988**)
2. **Client:** `cd client && npm install && npm start` (CRA dev server)

If the UI cannot reach the API, copy `client/.env.example` to `client/.env.local` and set `REACT_APP_API_URL` to the API base URL (no trailing slash).

For a production-style single process without Docker: `cd client && npm run build`, then `cd ../server && npm start` — the server serves `client/build` when present.

---

## Privacy and Git

- **Do not commit** `server/data/state.json` or the contents of your **`HOST_DATA_PATH`** directory. They hold your Life Master PIN and all game data.
- **Do not commit** `.env` (machine-specific paths). Use **`.env.example`** as the template.
- Do **not** commit `client/.env.local`.

---

## License

No license file is included by default; add a `LICENSE` if you want to specify terms for others.
