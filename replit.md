# ARIF-BOT V1

A GoatBot-based Facebook Messenger bot that listens for messages via the Facebook MQTT API.

## How to run

```
node index.js
```

The bot starts a small Express uptime server on **port 5000** and connects to Facebook Messenger using the cookies stored in `account.txt`.

## Stack

- **Runtime**: Node.js 20
- **Facebook API**: `fca-delta` (unofficial Facebook Chat API)
- **Database**: SQLite (via Sequelize) — stored at `database/data/data.sqlite`
- **Entry point**: `index.js` → `Sabbir.js` → `bot/login/login.js`

## Key config files

| File | Purpose |
|------|---------|
| `config.json` | Bot settings (prefix, language, database type, uptime, dashboard) |
| `configCommands.json` | Per-command/event env vars and banned commands |
| `account.txt` | Facebook session cookies (JSON array) |

## Project structure

```
├── index.js              # Entrypoint — spawns Sabbir.js, auto-restarts on exit code 2
├── Sabbir.js             # Initialises globals, loads config, calls login
├── bot/
│   ├── login/            # Login flow, data loader, script loader
│   ├── handler/          # Event/message handler
│   └── autoUptime.js     # Self-pings the uptime endpoint
├── scripts/
│   ├── cmds/             # Bot commands (one file per command)
│   └── events/           # Event handlers
├── database/
│   ├── connectDB/        # SQLite & MongoDB connectors
│   ├── controller/       # Data access layer
│   └── models/           # Sequelize models
├── func/
│   ├── utils.js          # Global utilities exported to global.utils
│   └── languages/        # getText i18n stub
└── dashboard/            # Optional web dashboard (disabled by default)
```

## Fixes applied on import

1. Removed malware `fs` npm package; added `overrides.tar` and `overrides.form-data` for security policy compliance.
2. Installed `bluebird` (required by `fca-delta`), `libuuid` system lib (required by `canvas`).
3. Fixed `bot/login/login.js`: broken callback structure (premature `});`), misplaced `loginBot` stub, wrong `fca-delta` import (destructure `{ login }`).
4. Uncommented `logColor`, `loading`, `getText` exports in `func/utils.js`; fixed their require paths.
5. Created `func/languages/makeFuncGetLangs.js` (i18n stub returning English messages).
6. Added `database` and `autoUptime` blocks to `config.json` (SQLite, autoUptime disabled).
7. Created missing `scripts/events/` directory.
8. Fixed truncated `threads[...]` placeholder in `bot/handler/handlerAction.js`.

## User preferences

- Keep the project's existing structure and stack.
