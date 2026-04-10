# Wonderful Game

Local-first web app for family skills, chores, XP, stars, coins, and rewards. A React UI talks to a small Express API; state is stored in a JSON file on disk.

The recommended way to run it is **Docker**: one container serves the API and the production-built SPA on **port 2988** (no separate static host or `/api` path split).

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

## API

HTTP API documentation: [`server/API.md`](server/API.md).

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
