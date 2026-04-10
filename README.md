# Wonderful Game

Local-first web app for family skills, chores, XP, stars, coins, and rewards. The React client talks to a small Express server that persists state to a JSON file on disk.

## Privacy before you publish

- **Do not commit** `server/data/state.json`. It contains your Life Master PIN, player names, and all progress. This repo’s `.gitignore` excludes it.
- If you previously copied the project into this folder with real data, delete `server/data/state.json` before sharing or run from a fresh clone so the file is never added to history.
- **Never** commit `.env` / `.env.local` (API URLs, keys, etc.).

## Requirements

- Node.js 18+ (LTS recommended)
- npm

## Run in development

**Terminal 1 — API (default port `2988`):**

```bash
cd server
npm install
npm start
```

**Terminal 2 — React dev server:**

```bash
cd client
npm install
npm start
```

If the UI cannot reach the API (e.g. different host/port), copy `client/.env.example` to `client/.env.local` and set `REACT_APP_API_URL` to your server base URL (no trailing slash).

## Production-style build (single process)

Build the client, then point the server at the build folder (default `../client/build`):

```bash
cd client && npm install && npm run build
cd ../server && npm install && npm start
```

The server serves static files from `client/build` when that directory exists. Override with `STATIC_DIR` if needed.

Optional environment variables (see `server/server.js`):

| Variable    | Purpose |
|------------|---------|
| `PORT`     | HTTP port (default `2988`) |
| `DATA_DIR` | Directory for `state.json` (default `server/data`) |
| `STATIC_DIR` | Path to React `build/` output |

## API

See [`server/API.md`](server/API.md).

## License

No license is specified in this repository; add your own `LICENSE` file if you want to grant others rights to use the code.

## Publish to GitHub

1. Create a **new empty repository** on GitHub (no README/license if you will push existing history).
2. In this project directory:

```bash
git init
git add .
git status   # confirm server/data/state.json is not listed
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your account and repository name.
